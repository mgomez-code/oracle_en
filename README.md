# Oracle_en
# Oracle tutorial
### How does it work?

Example of a smart contract that allows you to interact with the operating functions of an oracle. Allowing you to manage oracle questions and answers
## ********************************************************************************************************************************
## Code in Sophia
First, the functions used by the operator of the oracle to register, configure and maintain it are shown.
Secondly, the functions that allow users (clients) to request the information provided by Oracle are shown. 
To obtain this information, the client must cancel a fee.

## ************************************************************************************************************
## *****Key values ​​to store*****
## ************************************************************************************************************
## *****In this section all the variables of interest for the operation of the contract are declared*****

### Step by Step
#####  1.- Get the baseaepp  from any of the following links:
  - [Google Play](https://play.google.com/store/apps/details?id=com.aeternity.base)
  - [App Store](https://apps.apple.com/ru/app/base-%C3%A6pp-wallet/id1458655724)
#####  2.- Run the application and create an account.
#####  3.- Set the network to baseaepp. In setting > node on: Network select testnet.
#####  4.- Select an account.
#####  5.- Get test token.
        5.1- Copy address of the wallet.
        5.2- Enter the faucet through the following link using the browser of your choice:(https://testnet.faucet.aepps.com/)
        5.3- Paste Wallet address in the field intended for it.
        5.4- Click on the button identified as Top UP.
#####  6.- Verify the tokens in the base aepp wallet.
#####  7.- Enter the aepp base browser and copy the following
url:(https://mgomez-code.github.io/oracle/)
#####  8.- Press the command button identified as Fee Query. If the value of the Fee is obtained. Go to step 12
#####  9.- If the Fee value is not obtained, it indicates that at the time of the test the TTL of the oracle has expired.
#####  10.- Press the in the browser menu located in the upper right and we update the page.
#####  10.- Press the command button identified as Register Oracle. You will see a register message on the screen.
#####  11.- Press the command button identified as Fee Query.
#####  12.- It is verified that the screen displays the Fee Query value (10), in this case.
#####  13.- We go down on the screen and position ourselves in the Register section Question Answer.
#####  14.- We enter the questions and answers of our preference, For the purpose of this tutorial we will use the following:
	14.1- Question: Temperature / Answer: Ambient. Enter data and press the command button Register Question Answer. 
        14.2- Question: Humidity / Answer: Relative. Enter data and press the command button Register Question Answer. 
        14.3- Question: Radiation / Answer: Solar. Enter data and press the command button Register Question Answer. 
#####  15.- We go down on the screen and position ourselves in the section Create Query.
#####  16.- In the String field we put any of the questions that were registered in the previous step and the value 10 corresponding to the fee in the field Payment.
#####  17.- Press the command button to confirm the payment of the query to Oracle.
#####  18.- We verify on screen that the Query Id appears, which is what identifies the answer in the oracle.
#####  19.- Press the command button identified as Answer.
#####  20.- We go up on the screen and check the answer.
#####  21.- We repeat steps 16-20 for the remaining two question.
- [Oracle Operation Video](https://youtu.be/zHkx3Fbvux8)
