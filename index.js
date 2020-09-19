const contractSource = `
contract Oracles =
  record state = {  									
    source_oracle : map(address, oracle(string, string)),
    id_query : map(address, oracle_query(string, string)),
    question_answer : map(string, string)}

  stateful entrypoint init() : state =  						 
    { source_oracle = {},
      id_query = {}, 
      question_answer  = {} }

  stateful entrypoint register_oracle(      						// Function to Register the Oracle of the Contract
                           qfee : int,     						//Minimum payment fee
                           rttl : int) : oracle(string, string) =   			//oracle expiration time blocks
    let register: oracle(string, string) =  Oracle.register(Contract.address, qfee, RelativeTTL(rttl))
    put(state{ source_oracle[Contract.address] = register })
    register

  entrypoint get_oracle(): oracle(string, string) = 					 //Consult direction of the oracle
    switch(Map.lookup(Contract.address, state.source_oracle))
      None    => abort("Not registered")
      Some(x) => x
      
  entrypoint get_query(): oracle_query(string, string) =  				//Get query id
    switch(Map.lookup(Call.caller, state.id_query))
      None    => abort("No query")
      Some(x) => x

  entrypoint get_answer(stranswer : string) =  						//Check if there is an answer
    switch(Map.lookup(stranswer, state.question_answer))
      None    => abort("No Resitrado")
      Some(x) => x

  payable stateful entrypoint quest_answer(quest : string, answ : string) : bool =  		//Record response function
    let val = Call.value
    if(val > 0)
      false
    else
      put(state{question_answer[quest] = answ })
      true

  entrypoint query_fee(o : oracle(string, string)) : int =  					//get minimum payment of oracle
    Oracle.query_fee(o)

  payable stateful entrypoint create_query(      						//Make the consultation to the oracle
                                          o    : oracle(string, string),    			//oracle direction
                                          q    : string,      					//question
                                          qfee : int,         					//fee
                                          qttl : int,         					//TTL of oracle
                                          rttl : int) : oracle_query(string, string) =    	//rTTL of oracle
    require(qfee =< Call.value, "insufficient value for qfee")    //verifica el pago
    let query : oracle_query(string, string) = Oracle.query(o, q, qfee, RelativeTTL(qttl), RelativeTTL(rttl))    //records the query to the oracle, shows the id
    let query_answer = get_answer(q)
    Oracle.respond(o, query, query_answer)
    put(state{id_query[Call.caller] = query })
    query

  stateful entrypoint extend_oracle(  				//Extend the time of the oracle
                                    o   : oracle(string, string),
                                    ttl : int) : unit =
    Oracle.extend(o, RelativeTTL(ttl))

  stateful entrypoint respond(  					// Add the answer to the question they ask the oracle
                              o    : oracle(string, string),  //oracle direction
                              q    : oracle_query(string, string),  //id of query in oracle
                              r    : string) =  //reply
    Oracle.respond(o, q, r)        

  entrypoint get_question(  //see the question they asked the oracle according to id
                          o : oracle(string, string),    //oracle direction
                          q : oracle_query(string, string)) : string =    //id of query in oracle
    Oracle.get_question(o, q)      

  entrypoint has_answer(  //Check if the question has an answer
                       o : oracle(string, string),
                       q : oracle_query(string, string)) =
    switch(Oracle.get_answer(o, q))
      None    => false
      Some(_) => true

  entrypoint get__answer(  //Show the answer to a question
                       o : oracle(string, string),  //oracle direction
                       q : oracle_query(string, string)) : option(string) =    //oracle direction
    Oracle.get_answer(o, q)
    
  entrypoint contract_balance() = 
    Contract.balance
`;

//Address of the  smart contract on the testnet of the aeternity blockchain
//Dirección del contrato inteligente en el testnet de la blockchain de aeternity
const contractAddress = 'ct_15XeDq8XMoNkYpC3xSRCrtoJQpH4nfbT4tP5cD3yb29172wTd';

//Create variable for client so it can be used in different functions
//Crear la variable cliente para las funciones
var client = null;

//Create a new global array for the messages
//Crea un array para los mensajes
var mensajes = [];

//Create a asynchronous read call for our smart contract
//Cree una llamada de lectura asincrónica para uso de funciones estáticas
async function callStatic(func, args) {

	//Create a new contract instance that we can interact with
	//Cree una nueva instancia de contrato con la que podamos interactuar
	const contract = await client.getContractInstance(contractSource, {contractAddress});

	//Make a call to get data of smart contract func, with specefied arguments
	//Realice una llamada para obtener datos de funciones de contratos inteligentes, con argumentos específicos
	const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));

	//Make another call to decode the data received in first call
	//Realice otra llamada para decodificar los datos recibidos en la primera llamada
	const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

//Create a asynchronous write call for our smart contract
//Cree una llamada de escritura asincrónica para las funciones dinámicas
async function contractCall(func, args, value) {
	
	//Make a call to write smart contract func, with aeon value input
	//Realice una llamada para escribir una función de contrato inteligente, con una entrada de valor eón
	const contract = await client.getContractInstance(contractSource, {contractAddress});
	
	//Make a call to get data of smart contract func, with specefied arguments
	//Realice una llamada para obtener datos de funciones de contratos inteligentes, con argumentos específicos
	const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

	return calledSet;
}

//Execute main function
//Ejecutar función principal
window.addEventListener('load', async () => {

	//Display the loader animation so the user knows that something is happening
	//Muestra la animación de cargando....
	$("#loader").show();

	//Initialize the Aepp object through aepp-sdk.browser.js, the base app needs to be running.
	//Inicialice el objeto Aepp a través de aepp-sdk.browser.js, la aplicación base debe estar ejecutándose.
	client = await Ae.Aepp();

	//Hide loader animation
	//Oculta la animación de cargando
	$("#loader").hide();
});

//If someone clicks register Oracle,  execute register_oracle
//Si alguien hace clic para registrar oráculo, ejecute register_oracle
$('#registerOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const qfee = ($('#qfee').val());
	const ttl = ($('#ttl').val());
	const consul = await contractCall('register_oracle', [qfee,ttl], 0);
	if(consul){document.getElementById('messages').value = 'registered';}
	$("#loader").hide();
});

//If someone clicks to consult Address Oracle,  execute get_oracle
//Si alguien hace clic para consultar Dirección del Oráculo, ejecute get_oracle
$('#addressOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const consul = await callStatic('get_oracle',[]);
	document.getElementById('messages').value = consul;
	document.getElementById('address').value = consul;
	$("#loader").hide();
});

//If someone clicks extend Oracle,  execute extend_oracle
//Si alguien hace clic para externder oráculo, ejecute extend_oracle
$('#extendOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const address = ($('#messages').val());
	const qfee = ($('#qfee').val());
	const ttl = ($('#ttl').val());
	const consul = await contractCall('extend_oracle', [address,ttl], 0);
	if(consul){document.getElementById('messages').value = 'extend';}
	$("#loader").hide();
});

//If someone clicks register question answer,  execute quest_answer
//Si alguien hace clic para registrar pregunta respuesta, ejecute quest_answer
$('#quest_answerBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const question = ($('#question').val());
	const answer = ($('#answer').val());
	const consul = await contractCall('quest_answer', [question,answer], 0);
	if(consul){document.getElementById('messages').value = 'registered';}
	$("#loader").hide();
});

//If someone clicks to consult Question,  execute get_question
//Si alguien hace clic para consultar pregunta, ejecute get_question
$('#getQuestionBtn').click(async function(){
	$("#loader").show();
	const address = ($('#address').val());
	const idquery = ($('#idquery').val());
	client = await Ae.Aepp();
	const consul = await callStatic('get_question',[address,idquery]);
	document.getElementById('messages2').value = consul;
	$("#loader").hide();
});

//If someone clicks to check if you have an answer,  execute has_answer
//Si alguien hace clic para consultar si tiene respuesta, ejecute has_answer
$('#hasAnswerBtn').click(async function(){
	$("#loader").show();
	const address = ($('#address').val());
	const idquery = ($('#idquery').val());
	client = await Ae.Aepp();
	const consul = await callStatic('has_answer',[address,idquery]);
	document.getElementById('messages2').value = consul;
	$("#loader").hide();
});

//If someone clicks to consult Answer,  execute get_answer
//Si alguien hace clic para consultar respuesta, ejecute get_answer
$('#getAnswerBtn').click(async function(){
	$("#loader").show();
	const address = ($('#address').val());
	const idquery = ($('#idquery').val());
	client = await Ae.Aepp();
	const consul = await callStatic('get_answer',[address,idquery]);
	document.getElementById('messages2').value = consul.Some[0];
	$("#loader").hide();
});

//If someone clicks to consult balance,  execute contract_balance
//Si alguien hace clic para consultar balance, ejecute contract_balance
$('#balanceBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const consul = await callStatic('contract_balance',[]);
	document.getElementById('messages3').value = consul;
	$("#loader").hide();
});

//If someone clicks to consult Fee Query,  execute query_fee
//Si alguien hace clic para consultar Fee Query, ejecute query_fee
$('#queryFeeBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const address = ($('#address').val());
	const consul = await callStatic('query_fee',[address]);
	document.getElementById('fee').value = consul;
	$("#loader").hide();
});

//If someone clicks to create Query,  execute create_query
//Si alguien hace clic para crear query, ejecute create_query
$('#createQueryBtn').click(async function(){
	$("#loader").show();
	//Create new variable for get the values from the input fields
	//Crea nueva variables para obtener los valores de los campos de entrada.
	const address = ($('#address').val());
	const string = ($('#string').val()),
		  fee = ($('#fee').val());
	//Make the contract call to consult the oracle with the newly passed values
	//Llame al contrato para consultar el oráculo con los valores recibidos
	await contractCall('create_query', [address,string,fee,1,1], fee);
	const consul = await callStatic('get_query',[]);
	document.getElementById('idquery').value = consul;
	const result = await callStatic('get_answer',[string]);
	document.getElementById('messages4').value = result;
	$("#loader").hide();
});
