## Introduction

This app recognizes PII from a text file. The detected PII types are: 

* Name
* SNN
* Credit Card
* Location
* E-Mail Address
* Domain Name
* Crypto Wallet ID
* IP Address 
* Date Time
* Bank Account Number
* US Passport Number

## Simple Usage Example

* Build the Docker image
```
docker build -t pii-detector .
```
* Run the Docker container from Docker image
```
docker run -d -p 5001:3000 pii-detector:latest
```
* Pass the text stream
```
curl -d '{"text":"John Smith drivers license is AC4332223. Zip Code: 10023", "language":"en"}' -H "Content-Type: application/json" -X POST http://localhost:5001/analyze

[{"analysis_explanation": null, "end": 10, "entity_type": "PERSON", "score": 0.85, "start": 0}, {"analysis_explanation": null, "end": 39, "entity_type": "US_DRIVER_LICENSE", "score": 0.6499999999999999, "start": 30}]%   

```

It identifies the `start` and `end` of the pii and the `type` of the pii with a pertinent confidence `score`. 





