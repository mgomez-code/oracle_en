## Functions description Oracle
******************************
## Call Static Function
******************************
```sh
get_oracle	--> Consult direction of the oracle
get_balance 	--> Gets the balance of the oracle. arguments [OracleAddress : string]
queryFee	--> Get minimum payment for consultation to the oracle.arguments [OracleAddress : string]
getQuestion	--> Check the question they asked the oracle according to id. arguments [OracleAddress : string, OracleID : string]
hasAnswer	--> Check if the question has an answer. arguments [OracleAddress : string, OracleID : string]
getAnswer	--> Show the answer to a question. arguments [OracleAddress : string, OracleID : string]
```
******************************
## Call Function
******************************
```sh
register_oracle	--> Function to register the Oracle. arguments [qfee : int,  rttl : int]
get_query	--> Gets the query ID of the Oracle. arguments [OracleAddress : string]
respond		--> Record response function. arguments [OracleAddress : string, OracleID : string, r : string)]
quest_answer	--> Record question and answer function. arguments [quest : string, answ : string]
createQuery 	--> Payable function that asks the Oracle question. arguments [OracleAddress : string, q    : string, qfee : int, qttl : int, rttl : int]
extendOracle	--> Function that extend the time (TTL) of the oracle. arguments [OracleAddress : string, ttl : int]

```
******************************
## General-Purpose functions
******************************
```sh
contract_creator--> get the address with which the contract was created
contract_address--> get the contract address
contract_balance--> get the balance of the oracle
```
******************************
## Key used for compilation and deploy of the contract
******************************
```sh
public key : ak_2nniXZjP6vVDZCSpwkvXjbzCqKqHrXKQgv4ug2VnurumNE1Gfk
private key: f9f43aa1d70f59a1dd854d1ac51837d2b2b67f61cbc9b1eef276eab40147e6e8eba9f018046338e2a873dc3d0cdb75cc087906198fe629f9d9a1712f3ddf2d3b
```
