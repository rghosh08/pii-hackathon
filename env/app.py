"""REST API server for analyzer."""
import json
import logging
import os
from logging.config import fileConfig
from pathlib import Path
from typing import Tuple

from flask import Flask, request, jsonify, Response
from werkzeug.exceptions import HTTPException

from presidio_analyzer.analyzer_engine import AnalyzerEngine
from presidio_analyzer.analyzer_request import AnalyzerRequest
from flask import  flash, redirect, url_for
from werkzeug.utils import secure_filename

DEFAULT_PORT = "3000"

LOGGING_CONF_FILE = "logging.ini"

WELCOME_MESSAGE = r"""

"""


class Server:
    """HTTP Server for calling Presidio Analyzer."""

    def __init__(self):
        fileConfig(Path(Path(__file__).parent, LOGGING_CONF_FILE))
        self.logger = logging.getLogger("presidio-analyzer")
        self.logger.setLevel(os.environ.get("LOG_LEVEL", self.logger.level))
        self.app = Flask(__name__)
        self.logger.info("Starting analyzer engine")
        self.engine = AnalyzerEngine()
        self.path = "./uploads/."
        self.app.config['UPLOAD_FOLDER'] = self.path
        self.logger.info(WELCOME_MESSAGE)

        @self.app.route("/health")
        def health() -> str:
            """Return basic health probe result."""
            return "Presidio Analyzer service is up"

        @self.app.route("/analyze_file", methods=["POST"])
        def analyze_file() -> Tuple[str, int]:
              if 'file' not in request.files:
                return redirect(request.url)
              file = request.files['file']
              if file.filename == '':
                flash('No selected file')
                return redirect(request.url)
              filename = secure_filename(file.filename)
              file.save(os.path.join(self.app.config['UPLOAD_FOLDER'], filename))
              return Response(file_analyzer(self.path, filename),
                content_type="application/json",)

        @self.app.route("/analyze", methods=["POST"])
        def analyze() -> Tuple[str, int]:
            """Execute the analyzer function."""
            # Parse the request params
            try:
                req_data = AnalyzerRequest(request.get_json())
                if not req_data.text:
                    raise Exception("No text provided")

                if not req_data.language:
                    raise Exception("No language provided")

                recognizer_result_list = self.engine.analyze(
                    text=req_data.text,
                    language=req_data.language,
                    correlation_id=req_data.correlation_id,
                    score_threshold=req_data.score_threshold,
                    entities=req_data.entities,
                    return_decision_process=req_data.return_decision_process,
                    ad_hoc_recognizers=req_data.ad_hoc_recognizers,
                )

                return Response(
                    json.dumps(
                        recognizer_result_list,
                        default=lambda o: o.to_dict(),
                        sort_keys=True,
                    ),
                    content_type="application/json",
                )
            except TypeError as te:
                error_msg = (
                    f"Failed to parse /analyze request "
                    f"for AnalyzerEngine.analyze(). {te.args[0]}"
                )
                self.logger.error(error_msg)
                return jsonify(error=error_msg), 400

            except Exception as e:
                self.logger.error(
                    f"A fatal error occurred during execution of "
                    f"AnalyzerEngine.analyze(). {e}"
                )
                return jsonify(error=e.args[0]), 500

        @self.app.route("/recognizers", methods=["GET"])
        def recognizers() -> Tuple[str, int]:
            """Return a list of supported recognizers."""
            language = request.args.get("language")
            try:
                recognizers_list = self.engine.get_recognizers(language)
                names = [o.name for o in recognizers_list]
                return jsonify(names), 200
            except Exception as e:
                self.logger.error(
                    f"A fatal error occurred during execution of "
                    f"AnalyzerEngine.get_recognizers(). {e}"
                )
                return jsonify(error=e.args[0]), 500

        @self.app.route("/supportedentities", methods=["GET"])
        def supported_entities() -> Tuple[str, int]:
            """Return a list of supported entities."""
            language = request.args.get("language")
            try:
                entities_list = self.engine.get_supported_entities(language)
                return jsonify(entities_list), 200
            except Exception as e:
                self.logger.error(
                    f"A fatal error occurred during execution of "
                    f"AnalyzerEngine.supported_entities(). {e}"
                )
                return jsonify(error=e.args[0]), 500

        @self.app.errorhandler(HTTPException)
        def http_exception(e):
            return jsonify(error=e.description), e.code

        def file_analyzer(path, filename)-> Tuple[str, int]:
          with open(os.path.join(path, filename)) as f:
              lines = f.readlines()
              print(lines)
              data = {"text": ''.join(lines), "language":"en"}
              try:
                  req_data = AnalyzerRequest(data)
                  if not req_data.text:
                      raise Exception("No text provided")

                  if not req_data.language:
                      raise Exception("No language provided")

                  recognizer_result_list = self.engine.analyze(
                      text=req_data.text,
                      language=req_data.language,
                      correlation_id=req_data.correlation_id,
                      score_threshold=req_data.score_threshold,
                      entities=req_data.entities,
                      return_decision_process=req_data.return_decision_process,
                      ad_hoc_recognizers=req_data.ad_hoc_recognizers,
                  )

                  return (json.dumps(
                          recognizer_result_list,
                          default=lambda o: o.to_dict(),
                          sort_keys=True,))
              except TypeError as te:
                  error_msg = (
                      f"Failed to parse /analyze request "
                      f"for AnalyzerEngine.analyze(). {te.args[0]}"
                  )
                  return jsonify(error=error_msg), 400

              except Exception as e:
                  print(
                      f"A fatal error occurred during execution of "
                      f"AnalyzerEngine.analyze(). {e}")
                  return jsonify(error=e.args[0]), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", DEFAULT_PORT))
    server = Server()
    server.app.run(host="0.0.0.0", port=port)
