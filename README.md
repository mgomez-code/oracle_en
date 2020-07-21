# Oracle tutorial
This tutorial will provide an introduction to Sophia's syntax and some of its features with a "Source" smart contract using aeternity oracles. Running this tutorial should give the reader an idea of ​​the basic process of writing Sophia smart contracts. 
The contract that we will create in this tutorial will allow you to use the functions of the oracle operator to register and configure it, in such a way that it responds to the questions made by users (clients) on behalf of the oracle.

- [Recommended reading] (https://github.com/aeternity/protocol/blob/master/oracles/oracles.md)

## Code in Sophia
First, the functions used by the operator of the oracle to register, configure and maintain it are shown.
Secondly, the functions that allow users (clients) to request the information provided by Oracle are shown. 
To obtain this information, the client must cancel a fee.

## Key values ​​to store
In this section all the variables of interest for the operation of the contract are declared.
##### Key values
---
~~~
  record state = {  									
    source_oracle : map(address, oracle(string, string)),
    id_query : map(address, oracle_query(string, string)),
    question_answer : map(string, string)}
~~~
---
## Function Init 
In this section the contract is initialized and the initial values ​​are given to the variables
##### init
---
~~~
  stateful entrypoint init() : state =  						 
    { source_oracle = {},
      id_query = {}, 
      question_answer  = {} }
~~~
---
## Oracle Operator Functions
Functions that allow the oracle operator to register, configure and keep the oracle operational

##### Register the Oracle
---
~~~
  stateful entrypoint registerOracle(      						
    qfee : int,     	                                    //Minimum payment fee
    rttl : int) : oracle(string, string) =                //oracle expiration time blocks
    let register: oracle(string, string) =  Oracle.register(Contract.address, qfee, RelativeTTL(rttl))
    put(state{ source_oracle[Contract.address] = register })
    register
~~~
---
##### Consult oracle address
---
~~~
  entrypoint get_oracle(): oracle(string, string) =  					
    switch(Map.lookup(Contract.address, state.source_oracle))
      None    => abort("Not registered")
      Some(x) => x
~~~
---
##### Extend Oracle
---
~~~
  stateful entrypoint extendOracle(  							
                                  o   : oracle(string, string),	  //oracle address
                                  ttl : int) : unit =					 //oracle expiration time blocks 
    Oracle.extend(o, RelativeTTL(ttl))
~~~
---
##### Records the oracle's question and answer
---
~~~
  payable stateful entrypoint quest_answer(quest : string, answ : string) : bool = 
    let val = Call.value
    if(val > 0)
      false
    else
      put(state{question_answer[quest] = answ })
      true
~~~
---
##### Check the question that was asked to the oracle according to id
---
~~~
  entrypoint getQuestion(  								
                          o : oracle(string, string),    				         //oracle address
                          q : oracle_query(string, string)) : string =    //id of query in oracle
    Oracle.get_question(o, q)      							                         //show the question
~~~
---
##### Query function if the question has an answer
---
~~~
  entrypoint hasAnswer(  								
                       o : oracle(string, string),
                       q : oracle_query(string, string)) =
    switch(Oracle.get_answer(o, q))
      None    => false
      Some(_) => true
~~~
---
##### Shows the answer to a question
---
~~~
  entrypoint getAnswer(  
                       o : oracle(string, string),  					                 //oracle address
                       q : oracle_query(string, string)) : option(string) =    //id of query in oracle
    Oracle.get_answer(o, q)  								//show the answer
~~~
---
##### Obtains Balance of the contract
---
~~~
  stateful entrypoint contract_balance() = 
    Contract.balance
~~~
---
##### Query Id of the query associated with an address
---
~~~
  entrypoint get_query(): oracle_query(string, string) =  
    switch(Map.lookup(Call.caller, state.id_query))
      None    => abort("No query")
      Some(x) => x
~~~
---
## Oracle User Functions
Functions that allow users (clients) to interact with oracle

##### Consult minimum payment of the oracle
---
~~~
  entrypoint queryFee(o : oracle(string, string)) : int = 	//oracle address 				
    Oracle.query_fee(o)
~~~
---
##### Executes the query to the oracle and receives the commission for the query
---
~~~
  payable stateful entrypoint createQuery(      					
                                          o    : oracle(string, string),    		//oracle address
                                          q    : string,      				          //question
                                          qfee : int,         				          //fee
                                          qttl : int,         				          //last height oracle to post a reply
                                          rttl : int) : oracle_query(string, string) =      //time the response stays on the chain
    require(qfee =< Call.value, "insufficient value for qfee")    			//check the fee
    let query : oracle_query(string, string) = Oracle.query(o, q, qfee, RelativeTTL(qttl), RelativeTTL(rttl))    //records the query to the oracle, shows the id
    let query_answer = get_answer(q)
    Oracle.respond(o, query, query_answer)
    put(state{id_query[Call.caller] = query })
    query
~~~
---

##### Query function if there is a query response to the oracle
---
~~~
  entrypoint get_answer(stranswer : string) =  				//Check if there is an answer
    switch(Map.lookup(stranswer, state.question_answer))
      None    => abort("Not registered")
      Some(x) => x
~~~
---
##### Gets the answer to the oracle question
---
~~~
  stateful entrypoint respond(  
                              o    : oracle(string, string),  				//oracle address
                              q    : oracle_query(string, string),  	//id of query in oracle
                              r    : string) =  					            //reply
    Oracle.respond(o, q, r)        							                      //reply
~~~
---

## General Use Functions
Functions that allow both the operator and the users of the oracle to obtain interesting information

##### Returns True if the oracle exists and has the expected type
---
~~~
  entrypoint getCheck(
                       o : oracle(string, string)) =  		//oracle address
    Oracle.check(o)  									                    //show the answer
~~~
---
##### Function that shows the address of the contract creator
---
~~~
  stateful entrypoint contract_creator() = 
    Contract.creator
~~~
---
### Here is what the complete contract looks like:
---
~~~
contract Source =
  record state = {  									
    source_oracle : map(address, oracle(string, string)),
    id_query : map(address, oracle_query(string, string)),
    question_answer : map(string, string)}

  stateful entrypoint init() : state =  						 
    { source_oracle = {},
      id_query = {}, 
      question_answer  = {} }

  stateful entrypoint registerOracle(      						
        qfee : int,     						 //Minimum payment fee
        rttl : int) : oracle(string, string) =   //oracle expiration time blocks
    let register: oracle(string, string) =  Oracle.register(Contract.address, qfee, RelativeTTL(rttl))
    put(state{ source_oracle[Contract.address] = register })
    register

  entrypoint get_oracle(): oracle(string, string) =  					
    switch(Map.lookup(Contract.address, state.source_oracle))
      None    => abort("Not registered")
      Some(x) => x

  stateful entrypoint extendOracle(  							
                                o   : oracle(string, string),	//oracle address
                                ttl : int) : unit =		//oracle expiration time blocks 
    Oracle.extend(o, RelativeTTL(ttl))

  payable stateful entrypoint quest_answer(quest : string, answ : string) : bool = 
    let val = Call.value
    if(val > 0)
      false
    else
      put(state{question_answer[quest] = answ })
      true

  entrypoint getQuestion(  								
                o : oracle(string, string),    		              //oracle address
                q : oracle_query(string, string)) : string =    //id of query in oracle
    Oracle.get_question(o, q)      							                //show the question

  entrypoint hasAnswer(  								
                       o : oracle(string, string),
                       q : oracle_query(string, string)) =
    switch(Oracle.get_answer(o, q))
      None    => false
      Some(_) => true

  entrypoint getAnswer(  
        o : oracle(string, string),  					                  //oracle address
        q : oracle_query(string, string)) : option(string) =    //id of query in oracle
    Oracle.get_answer(o, q)  								                    //show the answer

  stateful entrypoint contract_balance() = 
    Contract.balance

  entrypoint get_query(): oracle_query(string, string) =  
    switch(Map.lookup(Call.caller, state.id_query))
      None    => abort("No query")
      Some(x) => x

  entrypoint queryFee(o : oracle(string, string)) : int = 	//oracle address 			
    Oracle.query_fee(o)

  payable stateful entrypoint createQuery(      					
        o    : oracle(string, string),    	//oracle address
        q    : string,      				//question
        qfee : int,         				//fee
        qttl : int,         				//last height oracle to post a reply
        rttl : int) : oracle_query(string, string) =  //time stays on the chain
    require(qfee =< Call.value, "insufficient value for qfee")    	//check the fee
    let query : oracle_query(string, string) = Oracle.query(o, q, qfee, RelativeTTL(qttl), RelativeTTL(rttl))
    let query_answer = get_answer(q)
    Oracle.respond(o, query, query_answer)
    put(state{id_query[Call.caller] = query })
    query

  entrypoint get_answer(stranswer : string) =  	    //Check if there is an answer
    switch(Map.lookup(stranswer, state.question_answer))
      None    => abort("Not registered")
      Some(x) => x

  stateful entrypoint respond(  
            o    : oracle(string, string),  	      //oracle address
            q    : oracle_query(string, string),    //id of query in oracle
            r    : string) =  			                //reply
    Oracle.respond(o, q, r)        				          //reply

  entrypoint getCheck(
                    o : oracle(string, string)) =  	    //oracle address
    Oracle.check(o)  									                  //show the answer

  stateful entrypoint contract_creator() = 
    Contract.creator
~~~
---
### Recommendation
To interact with the contract described in the tutorial, you can use the contract editor through the following URL: /http://studio.aepps.com/, or the GUI designed for it, the step by step is in the following document Step_by_step_oracle.md
