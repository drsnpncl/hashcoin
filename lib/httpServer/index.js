const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const R = require('ramda');
const path = require('path');
const swaggerDocument = require('./swagger.json');
const Block = require('../blockchain/block');
const Transaction = require('../blockchain/transaction');
const TransactionAssertionError = require('../blockchain/transactionAssertionError');
const BlockAssertionError = require('../blockchain/blockAssertionError');
const HTTPError = require('./httpError');
const ArgumentError = require('../util/argumentError');
const CryptoUtil = require('../util/cryptoUtil');
const timeago = require('timeago.js');

class HttpServer {
    constructor(node, blockchain, operator, miner) {
        this.app = express();
        
        this.app.use(session({
            secret: '2C44-4D44-WppQ38S',
            resave: true,
            saveUninitialized: true
        }));
        
        const projectWallet = (wallet) => {
            return {
                id: wallet.id,
                addresses: R.map((keyPair) => {
                    return keyPair.publicKey;
                }, wallet.keyPairs)
            };
        };

        this.app.use(bodyParser.json());
		
		this.app.use(bodyParser.urlencoded({extended: true}))
		
		this.app.set('view engine', 'pug');
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.locals.formatters = {
            time: (rawTime) => {
                const timeInMS = new Date(rawTime * 1000);
                return `${timeInMS.toLocaleString()} - ${timeago().format(timeInMS)}`;
            },
            hash: (hashString) => {
                return hashString != '0' ? `${hashString.substr(0, 5)}...${hashString.substr(hashString.length - 5, 5)}` : '<empty>';
            },
            amount: (amount) => amount.toLocaleString()
        };
        
        this.app.get('/api-docs/', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('api-docs.pug', {
                    pageTitle: 'API Documentation'
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });
		
        this.app.get('/', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('index.pug', {
                    pageTitle: 'Blockchain',
                    blocks: blockchain.getAllBlocks()
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });
		
        this.app.get('/wallet/create/', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('wallet/create/index.pug', {
                    pageTitle: 'Signup'
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });
		
        this.app.get('/transaction/add', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('transaction/add/index.pug', {
                    pageTitle: 'Transaction',
                    blocks: blockchain.getAllBlocks()
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });
		
		this.app.get('/transaction/wallet', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('transaction/wallet/index.pug', {
                    pageTitle: 'Transaction'
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });
        
		this.app.get('/blockchain', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/index.pug', {
                    pageTitle: 'Blockchain',
                    blocks: blockchain.getAllBlocks()
                });
            else
                throw new HTTPError(400, 'Accept content not supported');
        });

		this.app.get('/login',(req,res)=>{
			if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('login.pug', {
                    pageTitle: 'Log-in'
                });
            else
                throw new HTTPError(400, 'Log in page not created');
		});
        
		this.app.post('/login',(req,res)=>{
			let walletId = req.body.walletId;
            let address =  req.body.fromAddress;
			let password = req.body.password;
			let passwordHash = CryptoUtil.hash(password);
                    
			try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);
				else{
       				req.session.walletId=walletId;
                    req.session.address=address;
                    req.session.password=password;
                    
                    var blocks = blockchain.getTransactionsFromBlocks();
                    var blocksnew = [];
                    var count = 0;
                    
                    for(var i in blocks){
                        for(var j in blocks[i]){
                            for(var k in blocks[i][j].data.inputs){
                                if(blocks[i][j].data.inputs[k].address == address){
                                            blocksnew.push(blocks[i][j]);
                                            count++;
                                        }
                                    }
                                    for(var k in blocks[i][j].data.outputs){
                                        if(blocks[i][j].data.outputs[k].address == address){
                                            blocksnew.push(blocks[i][j]);
                                            count++;
                                        }
                                    }
                                }
                            }
                            
                    res.render('dashboard.pug',{
                        pageTitle: 'Dashboard',
                        balance: operator.getBalanceForAddress(address),
                        numoftra : count,
                        transactions : blocksnew,
                        address : address
                    })
                    
				}	
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
		});
        
        this.app.get('/logout',(req,res)=>{
			req.session.destroy();                
            res.render('index.pug',{
            })
        });
        
        this.app.get('/dashboard',(req,res)=>{
            let address =  req.session.address;
            if(!address){
                res.render('login.pug', {
                    pageTitle: 'Log-in'
                });
            }
            
            var blocks = blockchain.getTransactionsFromBlocks();
            var blocksnew = [];
            var count = 0;
            
            for(var i in blocks){
                for(var j in blocks[i]){
                    for(var k in blocks[i][j].data.inputs){
                        if(blocks[i][j].data.inputs[k].address == address){
                                    blocksnew.push(blocks[i][j]);
                                    count++;
                                }
                            }
                            for(var k in blocks[i][j].data.outputs){
                                if(blocks[i][j].data.outputs[k].address == address){
                                    blocksnew.push(blocks[i][j]);
                                    count++;
                                }
                            }
                        }
                    }
                    
            res.render('dashboard.pug',{
                pageTitle: 'Dashboard',
				balance: operator.getBalanceForAddress(address),
                numoftra : count,
                transactions : blocksnew,
                address : address
			})
		});
		
		this.app.get('/blockchain/blocks', (req, res) => {
            res.status(200).send(blockchain.getAllBlocks());
        });
		
        this.app.get('/blockchain/blocks/latest', (req, res) => {
            let lastBlock = blockchain.getLastBlock();
            if (lastBlock == null) throw new HTTPError(404, 'Last block not found');

            res.status(200).send(lastBlock);
        });
		
        this.app.put('/blockchain/blocks/latest', (req, res) => {
            let requestBlock = Block.fromJson(req.body);
            let result = node.checkReceivedBlock(requestBlock);

            if (result == null) res.status(200).send('Requesting the blockchain to check.');
            else if (result) res.status(200).send(requestBlock);
            else throw new HTTPError(409, 'Blockchain is update.');
        });
		
        this.app.get('/blockchain/blocks/:hash([a-zA-Z0-9]{64})', (req, res) => {
            let blockFound = blockchain.getBlockByHash(req.params.hash);
            if (blockFound == null) throw new HTTPError(404, `Block not found with hash '${req.params.hash}'`);

            res.status(200).send(blockFound);
        });
		
        this.app.get('/blockchain/blocks/:index', (req, res) => {
            let blockFound = blockchain.getBlockByIndex(parseInt(req.params.index));
            if (blockFound == null) throw new HTTPError(404, `Block not found with index '${req.params.index}'`);

            res.status(200).send(blockFound);
        });
		
        this.app.get('/blockchain/blocks/transactions/:transactionId([a-zA-Z0-9]{64})', (req, res) => {
            let transactionFromBlock = blockchain.getTransactionFromBlocks(req.params.transactionId);
            if (transactionFromBlock == null) throw new HTTPError(404, `Transaction '${req.params.transactionId}' not found in any block`);

            res.status(200).send(transactionFromBlock);
        });
		
        this.app.get('/blockchain/transactions', (req, res) => {
            if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                res.render('blockchain/transactions/index.pug', {
                    pageTitle: 'Unconfirmed Transactions',
                    transactions: blockchain.getAllTransactions()
                });
            else
                res.status(200).send(blockchain.getAllTransactions());
        });
		
        this.app.post('/blockchain/transactions/:TransactionId', (req, res) => {
            let requestTransaction = Transaction.fromJson(transactionId);
            let transactionFound = blockchain.getTransactionById(requestTransaction.id);

            if (transactionFound != null) throw new HTTPError(409, `Transaction '${requestTransaction.id}' already exists`);

            try {
                let newTransaction = blockchain.addTransaction(requestTransaction);
                res.status(201).send(newTransaction);
            } catch (ex) {
                if (ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, requestTransaction, ex);
                else throw ex;
            }
        });
		
        this.app.get('/blockchain/transactions/unspent', (req, res) => {
            res.status(200).send(blockchain.getUnspentTransactionsForAddress(req.query.address));
        });

        this.app.get('/operator/wallets/:walletId', (req, res) => {
            let walletFound = operator.getWalletById(req.params.walletId);
            if (walletFound == null) throw new HTTPError(404, `Wallet not found with id '${req.params.walletId}'`);

            let projectedWallet = projectWallet(walletFound);

            res.status(200).send(projectedWallet);
        });
        
        this.app.post('/operator/wallets/transactions/confirm', (req, res) => {
            let walletId = req.session.walletid;
            
                res.render('transaction/add/index.pug', {
                    pageTitle: 'Confirm Transaction',
                    walletid: '/operator/wallets/'+walletId +'/transactions'
                });
        });
        
        this.app.get('/operator/wallets/transactions/confirm', (req, res) => {
            let walletId = req.session.walletid;
                res.render('transaction/add/index.pug', {
                    pageTitle: 'Confirm Transaction',
                    walletid: '/operator/wallets/'+walletId +'/transactions'
                });
        });
        
        this.app.post('/operator/wallets/:walletId/transactions', (req, res) => {
            let walletId = req.session.walletId;
            let password = req.session.password;
            if(!password){
                res.render('login.pug', {
                    pageTitle: 'Log-in'
                });
            }1

            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

                let newTransaction = operator.createTransaction(walletId, req.session.address, req.body.toAddress, req.body.amount, req.body['changeAddress'] || req.session.address);

                newTransaction.check();

                let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
                res.render('transaction/created/index.pug', {
                    pageTitle: 'Transaction Details',
                    transaction: transactionCreated
                });
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });
		
		this.app.get('/operator/wallets', (req, res) => {
            let wallets = operator.getWallets();
            let projectedWallets = R.map(projectWallet, wallets);
            res.status(200).send(projectedWallets);
        });

        this.app.post('/operator/wallets', (req, res) => {
            let password = req.body.password;
            req.session.password = password;
            if (password.length <= 4) throw new HTTPError(400, 'Password must contain more than 4 words');
            let newWallet = operator.createWalletFromPassword(password);
            let projectedWallet = projectWallet(newWallet);
            
            res.render('wallet/created/index.pug', {
                pageTitle: 'Wallet Created',
                wallet: projectedWallet,
                formAction : "/operator/wallets/" + projectedWallet.id + "/addresses"
            });
        });
		
		this.app.get('/operator/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            try {
                let addresses = operator.getAddressesForWallet(walletId);
                res.status(200).send(addresses);
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });
		
        this.app.post('/operator/wallets/:walletId/addresses', (req, res) => {
            let walletId = req.params.walletId;
            req.session.walletId = walletId;
            let password = req.session.password;
            
            if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
            let passwordHash = CryptoUtil.hash(password);

            try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);
				let newAddress = operator.generateAddressForWallet(walletId);
                req.session.address = newAddress;
                let b=blockchain.getLastBlock();
				console.info(b.index);
				if(b.index>0){
                res.render('wallet/address-created/index.pug', {
                    pageTitle: 'Address Created',
					address: newAddress,
                });
				}
				else{
				miner.mine(newAddress, newAddress)
                .then((newBlock) => {
                    newBlock = Block.fromJson(newBlock);
                    blockchain.addBlock(newBlock);
                })
				res.render('wallet/address-created/index.pug', {
                    pageTitle: 'Address Created',
					address: newAddress,
                });
				}
				
				
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });

        this.app.get('/operator/:addressId/balance', (req, res) => {
            let addressId = req.params.addressId;

            try {
                let balance = operator.getBalanceForAddress(addressId);
                res.status(200).send({ balance: balance });
            } catch (ex) {
                if (ex instanceof ArgumentError) throw new HTTPError(404, ex.message, { addressId }, ex);
                else throw ex;
            }
        });

        this.app.get('/node/peers', (req, res) => {
			let peers = JSON.stringify(node.peers);
			res.render('node/peers/index.pug', {
                pageTitle: 'Peers',
                peers: JSON.parse(peers)
            });
        });

        this.app.post('/node/peers', (req, res) => {
            let newPeer = node.connectToPeer(req.body);
            res.status(201).send(newPeer);
        });

        this.app.get('/node/transactions/:transactionId([a-zA-Z0-9]{64})/confirmations', (req, res) => {
            node.getConfirmations(req.params.transactionId)
                .then((confirmations) => {
                    res.status(200).send({ confirmations: confirmations });
                });
        });
        
        this.app.get('/miner/mine', (req, res) => {
            res.render('miner/mine', {
                    pageTitle: 'Mine'
                });
        });
        
        this.app.post('/miner/mine', (req, res, next) => {
			
            let rewardAddress = req.body.address;
			let walletId = req.session.walletId;
            let password = req.session.password;
            let passwordHash = CryptoUtil.hash(password);
			try {
                if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);
				else{
					miner.mine(rewardAddress, req.body['feeAddress'] || rewardAddress)
					.then((newBlock) => {
                    newBlock = Block.fromJson(newBlock);
					blockchain.addBlock(newBlock);
					if (req.headers['accept'] && req.headers['accept'].includes('text/html'))
                        res.render('mined.pug', {
                            pageTitle: 'Block mined successfully!',
                            block : JSON.stringify(newBlock)
                        });
                    else
                        throw new HTTPError(400, 'Log in page not created');
                })
                .catch((ex) => {
                    if (ex instanceof BlockAssertionError && ex.message.includes('Invalid index')) next(new HTTPError(409, 'A new block were added before we were able to mine one'), null, ex);
                    else next(ex);
                });
				}	
            } catch (ex) {
                if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
                else throw ex;
            }
        });
		
		this.app.get('/blockchain/block/transactions', (req, res) => {
            res.render('Transaction/transactions/index.pug', {
                    pageTitle: 'transactions'
            });
        });
        
        this.app.post('/blockchain/block/transactions', (req, res, next) => {
            let address = req.body.address;
			res.status(200).send(blockchain.getUnspentTransactionsForAddress(req.query.address));
        });
		
		
        this.app.use(function (err, req, res, next) {  // eslint-disable-line no-unused-vars
            if (err instanceof HTTPError) res.status(err.status);
            else res.status(500);
            res.send(err.message + (err.cause ? ' - ' + err.cause.message : ''));
        });
    }

    listen(host, port) {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(port, host, (err) => {
                if (err) reject(err);
                console.info(`Listening http on port: ${this.server.address().port}`);
                resolve(this);
            });
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.server.close((err) => {
                if (err) reject(err);
                console.info('Closing http');
                resolve(this);
            });
        });
    }
}

module.exports = HttpServer;