import React, { Component } from 'react';
import loader from './loader.svg';
import './App.css';

import { exportFile, CSV_FILE } from 'fs-browsers';

const PII_URL = 'http://172.31.13.194:7000/analyze';

class App extends Component {

state = {
    data: null,
    input: '',
    loading: false,
    findings: []
};

  componentDidMount() {
    const inputElement = document.getElementById("input");
    inputElement.addEventListener("change", this.handleFile.bind(this), false);
  }

  handleFile(e) {
      const files = e.target.files;
      for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.addEventListener("load", () => this.onFileLoad(reader.result), false)
        reader.readAsText(file);
      }
  }

  onFileLoad(result) {
    this.setState({
        input: result,
    });
    this.analyzeText(result);
  }

  handleInputChange(e)  {
    const text = e.target.value;
    this.setState({
        input: text
    });
    if (text) {
        this.analyzeText(text);
    } else {
        this.setState({
            output: ''
        });
    }
  }

  analyzeText = async (result) => {
    const settings = {
        method: 'POST',
        url: PII_URL,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: result,
            language: "en"
        })
    };
    this.setState({
        loading: true
    });

    const response = await fetch('/pii', settings);
    const body = await response.json();
    const toReplace = [];
    let parsed = result;
    let raw = result;
    for (var i =0; i < body.length; i++) {
        const finding = body[i];
        const sliced = result.slice(finding.start, finding.end);
        toReplace.push({
            search: sliced,
            replace: finding.entity_type,
            start: finding.start,
            end: finding.end,
            score: finding.score,
            fieldType: finding.entity_type,
            text: sliced
        });
    }
    for (var i = 0; i < toReplace.length; i++) {
        let { search, replace } = toReplace[i];
        const replaceHTML = "<span class='highlight'>" + replace + "</span>";
        parsed = parsed.replace(search, replaceHTML);
        raw = raw.replace(search, replace)
    }
    this.setState({
        loading: false,
        output: parsed,
        rawOutput: raw,
        findings: toReplace,
        keywords: toReplace.map(r => r.replace)
    }, () => {
        var ele = document.getElementById("output");
        ele.innerHTML = parsed;
    });
  }

  renderOutput(output) {
    const { keywords } = this.state;
    var newHTML = "";
    var ele = document.getElementById("output");
    // Loop through words
    console.log(output)
    console.log(keywords)
    output.replace(/[\s]+/g, " ").trim().split(" ").forEach(function(val){
        console.log('hi')
        console.log(val)
      // If word is statement
      if (keywords.indexOf(val.trim().toUpperCase()) > -1)
        newHTML += "<span class='highlight'>" + val + "&nbsp;</span>";
      else
        newHTML += "<span class='other'>" + val + "&nbsp;</span>";
    });
    ele.innerHTML = newHTML;
  }

  callBackendAPI = async () => {
    const response = await fetch('/pii');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body;
  };

  exportOutput() {
      const {rawOutput} = this.state;
      exportFile(rawOutput, { fileName: 'anonymized-text.txt' });
  }

  exportFindings() {
      const { findings } = this.state;
      console.log(findings)
      const toExport = findings.map(f => {
        return {
            "Field Type": f.fieldType,
            "Score": f.score,
            "Text": f.text,
            "Start": f.start,
            "End": f.end
        };
      });
      exportFile(toExport, { type: CSV_FILE, fileName: 'findings.csv' });
  }

  render() {
    const { input, output, loading, findings } = this.state;
    return (
      <div className="">
        <header className="header">
          <div className="title">Text Anonymization</div>
        </header>

        <div className="upload-button-container">
            <input className="upload-button" type="file" id="input">

            </input>
        </div>

        <div className="container">
            <div className="text-container">
                <div className="text-container-title">
                    Input Text
                </div>
                <textarea id="input-textarea"
                    value={ input }
                    onChange={ (e) => this.handleInputChange(e)  }
                    className="input text">
                </textarea>
            </div>

            <div className="text-container">
                <div className="text-container-title">
                    <div>Anonymized Text</div>
                    <a
                        className="export"
                        href="javascript:;"
                        onClick={() => this.exportOutput()}>
                        Download
                    </a>
                </div>
                { loading ? (
                    <div className="loader-container output text">
                    <img width={100} height={100} src={loader} className="loader" alt="Loading..." />
                    </div>
                ) :
                // <textarea className="output text"
                //     readonly
                //     value={ output }
                // >
                // </textarea>
                <div className="output text"
                    contentEditable={ true }
                    id="output"
                >
                     { output }
                </div>
                }
            </div>
        </div>

        <div className="container findings">
            <div className="text-container">
                <div className="text-container-title">
                    <div>Discovery</div>
                    <a
                        className="export"
                        href="javascript:;"
                        onClick={() => this.exportFindings()}>
                        Download
                    </a>
                </div>
                <table>
                    <tr>
                        <th>Field Type</th>
                        <th>Score</th>
                        <th>Text</th>
                        <th>Start:End</th>
                    </tr>
                    { findings.map(finding => (
                        <tr>
                            <td>{ finding.fieldType }</td>
                            <td>{ finding.score }</td>
                            <td>{ finding.text }</td>
                            <td>{`${finding.start}:${finding.end}`}</td>
                        </tr>
                    ))}
                </table>

            </div>
        </div>

      </div>
    );
  }
}

export default App;
