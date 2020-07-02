const contractSource = `
contract Oracles =

  record state = {  // Valores claves a guardar
    greeter_oracle : oracle(string, string),
    id_query : map(address, oracle_query(string, string)),
    question_answer : map(string, string)}

  stateful entrypoint init() : state =  //Función de Inicio
    let greeter_oracle : oracle(string, string) = registerOracle(10,200)
    { greeter_oracle = greeter_oracle, id_query = {}, question_answer  = {} }

  stateful entrypoint registerOracle(      // Función para Registrar el Oraculo del Contracto
                           qfee : int,     //Fee de pago mínimo
                           rttl : int) : oracle(string, string) =   //bloques para el tiempo de vencimiento del oráculo
    Oracle.register(Contract.address, qfee, RelativeTTL(rttl))

  entrypoint get_oracle(): oracle(string, string) =  //Consulta dirección del oráculo
    state.greeter_oracle

  entrypoint get_query(): oracle_query(string, string) =  //Consulta id del query
    switch(Map.lookup(Call.caller, state.id_query))
      None    => abort("No query")
      Some(x) => x

  entrypoint get_answer(stranswer : string) =  //Consulta si hay respuesta
    switch(Map.lookup(stranswer, state.question_answer))
      None    => abort("No Resitrado")
      Some(x) => x

  payable stateful entrypoint quest_answer(quest : string, answ : string) : bool =  //Función registrar respuesta
    let val = Call.value
    if(val > 0)
      false
    else
      put(state{question_answer[quest] = answ })
      true

  entrypoint queryFee(o : oracle(string, string)) : int =  //Consulta pago mínimo para una consulta del oráculo
    Oracle.query_fee(o)

  payable stateful entrypoint createQuery(      //Hacer la consulta al oráculo, pagar
                                          o    : oracle(string, string),    //dirección del oráculo
                                          q    : string,      //pregunta
                                          qfee : int,         //pago
                                          qttl : int,         //controles de la última altura a la que el oráculo puede enviar una respuesta
                                          rttl : int) : oracle_query(string, string) =    //controla el tiempo que una respuesta se mantiene en la cadena
    require(qfee =< Call.value, "insufficient value for qfee")    //verifica el pago
    let query : oracle_query(string, string) = Oracle.query(o, q, qfee, RelativeTTL(qttl), RelativeTTL(rttl))    //registra la consulta al oráculo, muestra el id
    let query_answer = get_answer(q)
    Oracle.respond(o, query, query_answer)
    put(state{id_query[Call.caller] = query })
    query

  stateful entrypoint extendOracle(  //Extender el tiempo del oráculo
                                    o   : oracle(string, string),
                                    ttl : int) : unit =
    Oracle.extend(o, RelativeTTL(ttl))

  stateful entrypoint respond(  // Agrega la respuesta a la pregunta que realizan al oráculo
                              o    : oracle(string, string),  //dirección del oráculo
                              q    : oracle_query(string, string),  //id de la consulta en el oráculo
                              r    : string) =  //respuesta
    Oracle.respond(o, q, r)        //agraga la respuesta

  entrypoint getQuestion(  //consulta la pregunta que le hicieron al orácula según id
                          o : oracle(string, string),    //dirección del oráculo
                          q : oracle_query(string, string)) : string =    //id de la consulta en el oráculo
    Oracle.get_question(o, q)      //muestra la pregunta

  entrypoint hasAnswer(  //Consulta si la pregunta tiene respuesta
                       o : oracle(string, string),
                       q : oracle_query(string, string)) =
    switch(Oracle.get_answer(o, q))
      None    => false
      Some(_) => true

  entrypoint getAnswer(  //Muestra la respuesta a una preguna
                       o : oracle(string, string),  //dirección del oráculo
                       q : oracle_query(string, string)) : option(string) =    //id de la consulta en el oráculo
    Oracle.get_answer(o, q)  //muestra la respuesta
    
  //Funciones básicas
  
  stateful entrypoint contract_creator() = //dirección que creo el contracto
    Contract.creator

  stateful entrypoint contract_address() = //dirección del contracto
    Contract.address

  stateful entrypoint contract_balance() = //balance del contracto
    Contract.balance
`;

//Address of the  smart contract on the testnet of the aeternity blockchain
//Dirección del contrato inteligente en el testnet de la blockchain de aeternity
const contractAddress = 'ct_f9h17RwCCAnQzAUpSpFeCyz2xobRJr84TD6u1MDsJ184BcELt';

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

	const consul = await callStatic('get_oracle',[]);
	document.getElementById('adrress').value = consul;

	//Hide loader animation
	//Oculta la animación de cargando
	$("#loader").hide();
});

//If someone clicks to consult Fee Query,  execute queryFee
//Si alguien hace clic para consultar Fee Query, ejecute queryFee
$('#queryFeeBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const adrress = ($('#adrress').val());
	const consul = await callStatic('queryFee',[adrress]);
	document.getElementById("textnotice").innerHTML = "Fee Query: "+consul;
	div = document.getElementById('notice');
	div.style.display = '';
	$("#loader").hide();
});

//If someone clicks extend Oracle,  execute queryFee
//Si alguien hace clic para externder oráculo, ejecute extendOracle
$('#extendOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const adrress = ($('#adrress').val());
	await contractCall('extendOracle', [adrress,200], 0);
	document.getElementById("textnotice").innerHTML = "extend";
	div = document.getElementById('notice');
	div.style.display = '';
	$("#loader").hide();
});

//If someone clicks register Oracle,  execute queryFee
//Si alguien hace clic para registrar oráculo, ejecute registerOracle
$('#registerOracleBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const adrress = ($('#adrress').val());
	await contractCall('registerOracle', [10,200], 0);
	document.getElementById("textnotice").innerHTML = "register";
	div = document.getElementById('notice');
	div.style.display = '';
	$("#loader").hide();
});

//If someone clicks register question answer,  execute quest_answer
//Si alguien hace clic para registrar pregunta respuesta, ejecute quest_answer
$('#quest_answerBtn').click(async function(){
	$("#loader").show();
	client = await Ae.Aepp();
	const question = ($('#question').val());
	const answer = ($('#answer').val());
	await contractCall('quest_answer', [question,answer], 0);
	$("#loader").hide();
});

//If someone clicks to create Query,  execute createQuery
//Si alguien hace clic para crear query, ejecute createQuery
$('#createQueryBtn').click(async function(){
	$("#loader").show();

	//Create new variable for get the values from the input fields
	//Crea nueva variables para obtener los valores de los campos de entrada.
	const adrress = ($('#adrress').val());
	const string = ($('#string').val()),
		  number = ($('#number').val());

	//Make the contract call to consult the oracle with the newly passed values
	//Llame al contrato para consultar el oráculo con los valores recibidos
	await contractCall('createQuery', [adrress,string,10,50,50], number);
	const consul = await callStatic('get_query',[]);

	document.getElementById('idquery').value = consul;

	$("#loader").hide();
});

//If someone clicks to consult Answer,  execute getAnswer
//Si alguien hace clic para consultar respuesta, ejecute getAnswer
$('#getAnswerBtn').click(async function(){
	$("#loader").show();
	const adrress = ($('#adrress').val());
	const idquery = ($('#idquery').val());
	client = await Ae.Aepp();
	const consul = await callStatic('getAnswer',[adrress,idquery]);
	document.getElementById("textnotice").innerHTML = "Answer: "+consul.Some[0];
	div = document.getElementById('notice2');
	div.style.display = '';
	$("#loader").hide();
});
	