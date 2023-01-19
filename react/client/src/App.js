import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainid: null,
        // solidityInput: 0,
        // solidityRadio: "0",
        // vyperStorage: null,
        // vyperValue: 0,
        token: null,
        voter: null,
        proposal: "",
        proposals_keys: null,
        proposals_data: null,
        proposals_voted: null,
        prp_key: 0, 
        f: null, 
        g: null
    }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        try {
            const ethereum = await getEthereum()
            ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        const accounts = await web3.eth.getAccounts()

        // Get the current chain id
        const chainid = parseInt(await web3.eth.getChainId())

        this.setState({
            web3,
            accounts,
            chainid
        }, await this.loadInitialContracts)

    }

    loadInitialContracts = async () => {
        // <=42 to exclude Kovan, <42 to include kovan
        // if (this.state.chainid < 42) {
            // Wrong Network!
            // return
        // }
        console.log(this.state.chainid)
        
        var _chainID = 0;
        if (this.state.chainid === 42){
            _chainID = 42;
        }
        if (this.state.chainid === 1337 || this.state.chainid === 1){
            _chainID = "dev"
        }

        console.log(_chainID)
        const token = await this.loadContract(_chainID,"Token")
        const voter = await this.loadContract(_chainID,"Voter")

        if (!token || !voter) {
            return
        }

        this.setState({
            token,
            voter
        }, await this.getProposals)
    }

    getProposals = async() => {
        const {accounts, voter} = this.state

        console.log(accounts[0])

        const prp = await voter.methods.getProposalsF(accounts[0]).call()
        console.log(prp)

        const proposals_keys = prp["0"]
        const proposals_data = prp["1"]
        const proposals_voted = prp["2"]
        let fs = []
        let gs = []

        for (var i = 0; i < proposals_keys.length; i++) {
            let key = parseInt(proposals_keys[i])
            let ff = await voter.methods.getVotesForAmount(key).call()
            let gg = await voter.methods.getVotesGainAmount(key).call()
            fs[i] = ff
            gs[i] = gg
        }

        const f = fs
        const g = gs

        this.setState({
            proposals_keys,
            proposals_data,
            proposals_voted,
            f,
            g
        })
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }

        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }

        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    changeVyper = async (e) => {
        const {accounts, vyperStorage, vyperInput} = this.state
        e.preventDefault()
        const value = parseInt(vyperInput)
        if (isNaN(value)) {
            alert("invalid value")
            return
        }
        await vyperStorage.methods.set(value).send({from: accounts[0]})
            .on('receipt', async () => {
                this.setState({
                    vyperValue: await vyperStorage.methods.get().call()
                })
            })
    }

    sendProposal = async (e) => {
        const {accounts, voter, proposal} = this.state
        e.preventDefault()
        console.log(proposal)
        console.log(this.str2hex(proposal))
        const value = this.str2hex(proposal)
        if (value === "") {
            alert("invalid value")
            return
        }

        var bytes = []; // char codes
        var bytesv2 = []; // char codes

        for (var i = 0; i < proposal.length; ++i) {
          var code = proposal.charCodeAt(i);
          
          bytes = bytes.concat([code]);
          
          bytesv2 = bytesv2.concat([code & 0xff, code / 256 >>> 0]);
        }

        // await vyperStorage.methods.set(10).send({from: accounts[0]})
        //     .on('receipt', async () => {
        //         this.setState({
        //             vyperValue: await vyperStorage.methods.get().call()
        //         })
        //     })

        await voter.methods.propose(value).send({from: accounts[0]})
            .on('receipt', async () => {
                this.getProposals()
            })
        // await voter.methods.propose([]).send({from: accounts[0]})
        //     .on('receipt', async () => {
        //         const prp = await voter.methods.getProposals().call()
        //         this.setState({
        //             proposals_keys: prp["0"],
        //             proposals_data: prp["1"],
        //             proposals_voted: prp["2"]
        //         })
        //     })
    }

    accept = async (e, key) => {
        const {accounts, voter} = this.state
        console.log(key)
        e.preventDefault()
        // await vyperStorage.methods.set(key).send({from: accounts[0]})
        //     .on('receipt', async () => {
        //         this.setState({
        //             vyperValue: await vyperStorage.methods.get().call()
        //         })
        //     })
        await voter.methods.vote(key, true).send({from: accounts[0]})
            .on('receipt', async () => {this.getProposals()})
    }

    reject = async (e, key) => {
        const {accounts, voter} = this.state
        console.log(key)
        e.preventDefault()
        // await vyperStorage.methods.set(key).send({from: accounts[0]})
        //     .on('receipt', async () => {
        //         this.setState({
        //             vyperValue: await vyperStorage.methods.get().call()
        //         })
        //     })
        await voter.methods.vote(key, false).send({from: accounts[0]})
            .on('receipt', async () => {this.getProposals()})
    }

    hex2str(hexx) {
        var hex = hexx.toString();
        var str = '';

        for (var i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }

        return str;
    }

    str2hex(str) {
        var hex = '';

        for(var i = 0; i < str.length; i++) {
            hex += '' + str.charCodeAt(i).toString(16);
        }

        return hex;
    }

    render() {
        const {
            web3, accounts, chainid, f, g,
            token, voter, proposals_keys, proposals_data, proposals_voted
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        // <=42 to exclude Kovan, <42 to include Kovan
        if (isNaN(chainid)) {
            return <div>Wrong Network ({chainid})! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!token || !voter) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        var props = []

        if (proposals_keys) {
            props = []
            for (var i = 0; i < proposals_keys.length; i++) {
                let key = parseInt(proposals_keys[i])
                props[i] = {"key": key, "data": proposals_data[i], "voted": proposals_voted[i], "for": f[i], "gain": g[i]}
            }
        }

        console.log(props)

        return (<div className="App">
            <div className="header"><label>ICE DAO</label></div>
            <div className="status">
                {
                    !isAccountsUnlocked ?
                        <p><strong>Connect with Metamask and refresh the page to
                            be able to edit the storage fields.</strong>
                        </p>
                        : <h2>Current proposals</h2>
                }
            </div>
            <div className="prop-body">
                {props.map((item, index) => 
                    <div key={index} className="proposal">
                        <p className="proposal-text">{item["key"] + " " + this.hex2str(item["data"])}</p>
                        {item["voted"] || item["for"] >= 50 || item["gain"] >= 50 ? <label className="proposal-button">({item["for"]})</label> : <button className="proposal-button" onClick={(e) => {
                            console.log(index)
                            console.log(item["key"])
                            this.accept(e, item["key"])
                        }}>Accept</button>}
                        {item["voted"] || item["for"] >= 50 || item["gain"] >= 50 ? <label className="proposal-button">({item["gain"]})</label> : <button className="proposal-button" onClick={(e) => {
                            console.log(index)
                            console.log(item["key"])
                            this.reject(e, item["key"])
                        }}>Regect</button>}
                    </div>
                )}
            </div>
            <div className="footer">
                <form onSubmit={(e) => this.sendProposal(e)}>
                    <div className="add-prop">
                        <textarea
                            className="prop-in"
                            placeholder="Enter proposal"
                            onChange={(e) => this.setState({proposal: e.target.value})}
                        />
                        <button 
                            className="submit-prop" 
                            type="submit" 
                            disabled={!isAccountsUnlocked}>Propose</button>
                    </div>
                </form>
            </div>
        </div>)
    }
}

export default App
