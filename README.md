![Hackathon](hackathon.jpg)

## Purpose

This project aims to develop an application to extract a personal identifiable information (PII) from a text file or an input text. 

## Problem Statement
 U.S. DEPARTMENT OF LABOR defines PII as a representation of information that permits the identity of an individual to whom the information applies to be reasonably inferred by either direct or indirect means. Essentially, PII is defined as information that directly identifies an individual. The examples of PII includes: 

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

 The loss of PII can result in substantial harm to individuals, including identity theft or other fraudulent use of the information. With growing digitalization, the PII data are increasingly being stored and processed on cloud. Safeguarding PII information is a critical requirement for any enterprise cloud/infrastructure vendor such as Nutanix. However, rapid growth of enterprise data volume, velocity, and variety poses security and governance risks because the traditional rule-based PII detection and maintainance methods do not scale. That is why we are offering a deep learning based application which can quickly extract PII information from 
 a text file or an input text.

## Impact
Data Governance and security is a critical requirement for an multi-cloud infrastructure.

## Demo
[Demo Link](http://54.184.187.125:3000/)


## Introduction

This app recognizes PII from a text file. The detected PII types are: 



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





