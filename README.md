# hashcoin
A Crypto-Currency Wallet Project

# ABSTRACT
  The banking system we know, uses a centralized system. Banks keep track of our personal details as well as our money. Bank charges fees to manage our account and provide services. Being a centralized system, if the server gets down for any reason, whole system stops for a time being. If the system gets intruded, all the data and money of all the users is at risk.
  The purpose of our project is to create a decentralized distributed system which is more secure over centralized systems. Decentralized systems provides us with less vulnerability to server issues and intruders because no single authority has control over the whole system
HashWallet is a crypto-currency wallet which directly interact with the blockchain system while remaining in full control of users’ keys & funds. It’s fully secure and only a user is responsible for their security. HashWallet provides a client-side interface to send/receive HashCoins, keep track of users’ previous transactions and check unspent HashCoins. Users can see the whole blockchain of all confirmed transactions and the list of unconfirmed transactions which are not validated yet. The authenticity of sender and receiver both is checked using digital signatures. Every transaction have its unique signature.
  Blocks of Blockchain system contains the confirmed transactions. All blocks generate a hash which is used to create hash for the next block. This is how a chain of blocks is created. During the validation of the transaction whole blockchain is being checked, which exposes a single or multiple blocks which are tempered. This is the main reason behind the security of blockchain system.
HashWallet uses HTTP server to create a decentralized distributed system. Blockchain is maintained simultaneously on all the nodes of the system. Any change in blockchain from a single node causes the blockchain resided in all other nodes to be updated.
  Summarizing, HashWallet is designed to use as a personal bank. Users do not have to rely on banks for their accounting and pay for that. They can transfer the money in the form of HashCoins which is totally free of any costs.
  The Project is developed using NodeJS and its various packages such as Ramda, Express, Crypto, Path; etc. Front-end is being dynamically rendered from PugJS (Formerly known as Jade) and designed using Bulma CSS framework.

# INTRODUCTION

# 1.1	Problem Definition
  The current computation systems we are using, are centralized system. Be it banking system, social networks, government web applications, colleges’ online database systems etc. In such systems the database is stored, located and maintained in a single location. 
  Centralized systems also have a certain amount of limitations, such as those described below:
    •	Centralized databases are highly dependent on network connectivity. The slower the connection is, the longer the database access    time needed will be.
    •	Bottleneck can occur as a result of high traffic.
    •	Limited access by more than one person to the same set of data as there is only one copy of it and it is maintained in a single location. This can lead to major decreases in the general efficiency of the system.
    •	Since there is minimal to no data redundancy, if a set of data is expectedly lost it is very hard to retrieve it back, in most cases it would have to be done manually.
  Taking an example of bank, when we open an account with a bank, they create an account for us in their system. The bank keeps track of our personal information, account passwords, balances, transactions and ultimately our money. The bank charges fees to manage our account and provide services, like refunding transactions when your card gets stolen. Bank allow us to write a check or charge our debit card to send money, go online (or ATM ) to check your balance, reset our passwords, and get a new debit card if we lose it. We have an account with the bank and they decide how much money can we send, where we can send it, and how long to hold on a suspicious deposit. All for a fee.

# 1.2	Project Overview 
  A distributed system is a database in which all the information is stored on multiple physical locations. Because distributed system store data across multiple computers, distributed systems may improve performance at end-user worksites by allowing transactions to be processed on many machines, instead of being limited to one. Distributed systems increase reliability and availability, protects valuable data, improve performance, provide better economics, provide reliable transactions and single-site failure does not affect performance of system.
  HashWallet is client-side interface which allows users to send/receive HashCoins, check available balance and keep track of their transactions. HashWallet is created upon a blockchain and the blockchain is built on peer-to-peer network which is a decentralized distributed network. 
  The whole project have certain modules, as given below:
    •	HTTP Server
    •	Node
    •	Blockchain
    •	Operator
    •	Miner


# 1.2.1	HTTP Server
HTTP Server contains all the methods for request-response model of the web-application. It also contains views to render front-end design pages. It starts the local server in the client machine and serve according to request-response model.

# 1.2.2	Node
  Node module contains functionalities to make a peer-to-peer connections from machines having running HTTP servers on it. Which makes a network for decentralized distributed system. Node module have responsibility to broadcast the blockchain when it changes. It also sends unconfirmed transactions to its specified file on a client machine.

# 1.2.3	Blockchain
  Blockchain consists two major classes Block and Blockchain. Confirmed transactions are stored in blocks. Each block has its hash and it also contains the hash of previous block, which is used to generate hash for a current block. This is how blocks connects with other blocks via hash and create a chain of blocks, which is known as blockchain.
Blockchain has functionalities to add blocks, generate hash, and traverse through whole blockchain to check its integrity of all the blocks, replace the whole blockchain etc. It also have control over transactions. And provide functionalities to add/remove transaction, create digital signature for every transaction, check integrity of transaction using digital signature and functions to It is the main module of the system and heart of the project.

# 1.2.4	Operator
  Operator module contains all the operations being carried out on the blockchain.
It contains transaction builder, which builds the transaction using blockchain and store it in client machine. It also contains classes for wallet and wallets which are responsible to create a HashCoin wallet for user, generate multiple addresses (public keys), add wallet to wallets, which contains all the detail about created wallets on a single machine.

#1.2.5	Miner
  Miner module have functionalities to	mine a block that is to create a block from unconfirmed transactions after checking integrity of those transactions. Mining a block gives a reward to users who are in the mining process, called miners. Anyone can be a miner in HashWallet unlike Bitcoins and can earn mining reward in terms of HashCoins.

# 1.3	Hardware Specifications
  The project is a NodeJS application which can run on just above any operating system, Windows, Mac OSX and most Linux Distributions. NodeJS run comfortably on system with 256MB RAM and a single core processor.

# 1.4	Software Specifications
  HashWallet needs a web-browser to run. It runs on all kinds of standard browsers. Such as Google Chrome, Firefox, Microsoft Edge etc.

# CONCLUSIONS
  According to our idea the old centralized systems we are currently using are safe and secure for now but in future it might be in severe danger as stated earlier. In the other hand decentralized distributed systems provides us more security and transparency of our data, that too at lower costs. 
  We can use this blockchain platform to create several systems as we created a Crypto-Currency Wallet. This wallet is prone to almost any kind of security attacks. 
  In early 2017, Harvard Business School professors Marco Iansity and Karim R. Lakhani said “the blockchain is not disruptive technology that undercuts the cost of an existing business model, but is a foundational technology that has the potential to create new foundations for our economic and social systems.” 
  And now we can assure you that in upcoming decade, all the systems we are currently using will be changed with blockchain based systems.
