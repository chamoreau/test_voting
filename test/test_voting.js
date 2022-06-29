const Voting = artifacts.require('./Voting.sol');
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

/* ALYRA PROJECT 2 : TEST UNITAIRES */
/*------Charles MOREAU-------------*/
contract ('Voting', users => {
    const owner =users[0]
    const firstuser =users[1]
    const seconduser =users[2]

    let VotingInstance;
    // ::::::::::::: GETTERS ::::::::::::: //
    describe("Testing getters functions", function() {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from : owner}); 
        });
        
        //testing if a non-voter can get to see proposals 
        //MAY NOT WORK-- CHECK
        it("Revert if a non-voter can get proposals ", async () => {
            await VotingInstance.addVoter(owner,{from:owner});
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("anarchy",{from:owner});
            await expectRevert(await VotingInstance.getOneProposal(new BN(0), {from:firstuser}), "You're not a voter");
         });



    });



    // ::::::::::::: REGISTRATION ::::::::::::: //
    describe("Testing the function adding voters", function() {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from : owner});
            
            
        });

        it("should store voter in mapping ", async () =>{
            await VotingInstance.addVoter(firstuser,{from:owner});
            const StoreVoter = await VotingInstance.getVoter(firstuser, {from:firstuser});
            expect(StoreVoter.isRegistered).to.be.true;
            expect(StoreVoter.hasVoted).to.be.false;
            expect(StoreVoter.votedProposalId==0)
        });

        
        it("checks if the event VoterRegistered is emitted", async () => {
            const checkVoter = await VotingInstance.addVoter(firstuser, { from: owner });
            expectEvent(checkVoter, 'VoterRegistered', { voterAddress: firstuser });
        });
        
        //testing if a random user can call owner only functions
        it("Revert if caller is not the owner", async () => {
            await expectRevert(VotingInstance.addVoter(seconduser, {from: firstuser}), 'caller is not the owner');
         });
        
         //testing if a user can register multiple times
         it("Revert if voter is already registered", async () => {
            await VotingInstance.addVoter(firstuser, { from: owner });
            await expectRevert(VotingInstance.addVoter(firstuser, {from: owner}), 'Already registered');
         });
        
         //testing if a user can vote while not in the right session
         it("Revert if not in the registration session ", async () => {
            await VotingInstance.startProposalsRegistering();
            await expectRevert(VotingInstance.addVoter(firstuser, {from: owner}), 'Voters registration is not open yet.'); 
        });
        

        

    });
     // ::::::::::::: PROPOSAL ::::::::::::: //
     describe("Testing the function adding proposals", function() {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from : owner});
            await VotingInstance.addVoter(firstuser,{from:owner});
        });

        it("should store proposal in array ", async () =>{
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("anarchy",{from:firstuser});
            const StoreProposal = await VotingInstance.getOneProposal(new BN(0), {from:firstuser});
            expect(StoreProposal.description).to.equal("anarchy");
        });

        it("checks if the event ProposalRegistered is emitted", async () => {
            await VotingInstance.startProposalsRegistering();
            const checkProposal = await VotingInstance.addProposal("anarchy", {from: firstuser});
            expectEvent(checkProposal, 'ProposalRegistered');
        });

        //testing if a non-voter can add a proposal
        it("Revert if non voter wants to add a proposal", async () => {
            await expectRevert(VotingInstance.addProposal("anarchy", {from: seconduser}), "You're not a voter");
        });
        
        //testing if a user can send a proposal while not in the right session
        it("Revert if not in the Proposal session ", async () => {
            await expectRevert(VotingInstance.addProposal("anarchy", {from: firstuser}), "Proposals are not allowed yet"); 
        });
    });
    // ::::::::::::: VOTE ::::::::::::: //
    describe("Testing the function set votes", function() {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from : owner});
            await VotingInstance.addVoter(firstuser,{from:owner});
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("anarchy", {from: firstuser});
            await VotingInstance.endProposalsRegistering();
            
        });

            
        it("checks if the event Vote is emitted", async () => {
            await VotingInstance.startVotingSession();
            expectEvent(await VotingInstance.setVote(new BN(0), {from: firstuser}), "Voted", {
                voter:firstuser,
                proposalId: new BN(0)
             });

           
        });
        //testing if the user can vote multiple times
        it("Revert if voter has already voted ", async () => {
            await VotingInstance.startVotingSession();
            await VotingInstance.setVote(new BN(0), {from: firstuser});//Votes for the first proposal in the array
            await expectRevert(VotingInstance.setVote(new BN(0), {from : firstuser} ), 'You have already voted');
         });
         
         //testing if the user can vote even during the wrong workflow status
         it("Revert if not in the voting session ", async () => {
            await expectRevert(VotingInstance.setVote(new BN(0), {from : firstuser} ), 'Voting session havent started yet');
         });
         
         //testing if user can input a non existing proposalID (in this case propid =10)
         it("Revert if voter has already voted ", async () => {
            await VotingInstance.startVotingSession();
            await expectRevert(VotingInstance.setVote(new BN(10), {from : firstuser} ), 'Proposal not found');
         });
 
    });

    // ::::::::::::: TALLY VOTES ::::::::::::: //
    describe("Testing the function tally votes", function() {
        
        beforeEach(async function () {
            VotingInstance = await Voting.new({from : owner}); 
        });

        it("should return the highest voted proposal ", async () =>{
            await VotingInstance.addVoter(owner, {from: owner});
            await VotingInstance.addVoter(firstuser, {from: owner});
            await VotingInstance.addVoter(seconduser, {from: owner});
            
            await VotingInstance.startProposalsRegistering();

            await VotingInstance.addProposal("anarchy", {from: owner});
            await VotingInstance.addProposal("democraty", {from: seconduser});

            await VotingInstance.endProposalsRegistering();
            await VotingInstance.startVotingSession();

            await VotingInstance.setVote(new BN(0), {from: owner});
            await VotingInstance.setVote(new BN(0), {from: firstuser});
            await VotingInstance.setVote(new BN(1), {from: seconduser});
            
            await VotingInstance.endVotingSession();
            await VotingInstance.tallyVotes();
            
            const result = await VotingInstance.winningProposalID();
            expect(new BN (result)).to.be.bignumber.equal(new BN (0));

        });
        /*it("Revert if the voting session hasn't ended ", async () => {
            await VotingInstance.startVotingSession();
            await expectRevert(VotingInstance.tallyVotes({from : owner}), 'Registering proposals phase is not finished');
         });*/



    });

    // ::::::::::::: STATE ::::::::::::: //
    describe("Testing change of states functions", function() {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from : owner}); 
        });
        /*it("Revert if the voting session hasn't ended ", async () => {
            await VotingInstance.startProposalsRegistering();
            
            await expectRevert(await VotingInstance.endVotingSession(), 'Registering proposals phase is not finished');
         });*/



    });




})