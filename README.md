# Test_voting

1) Testing Getters  
 -Testing if a non-voter can get proposals (this one might not work just check)

2) Testing registration (add voters) process
 -test if storing voter in mapping works 
 -test if the event VoterRegistered is emitted
 => test requires
 - testing if a random user can call owner only functions
 - testing if a user can register multiple times
 - testing if a user can vote while not in the right session

3) Testing proposal adding process
 -test if storing proposal in array works 
 -tests if the event ProposalRegistered is emitted
 => test requires
 -testing if a non-voter can add a proposal
 -testing if a user can send a proposal while not in the right session

4) Testing voting process (setVotes)
 -test if the event Voted is emitted
 => test requires
 -testing if the user can vote multiple times
 -testing if the user can vote even during the wrong workflow status
 -testing if user can input a non existing proposalID (in this case propid =10)

5) Testing tally votes function
-test if the  function return the highest voted proposal

6)Testing change of states 
- tried but doesn't really seem to work -- this part is commented at the end 