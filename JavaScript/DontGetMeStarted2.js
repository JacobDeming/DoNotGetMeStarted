$(document).ready(function(){


//Initialize the "topics" and the "pastTopics" arrays
var topics=["The Impending Robot Invasion","Baby Carrots","Zelda Games","A Tiny Donkey That Only Speaks Spanish","Clowns","The Resurgence of 80's Media","Superheroes","Vampires","Ferris Wheels","Big Pharma","The Patriarchy","Terrible Roommates","After School Drug Programs","Italian Cuisine","A Brick of Uncut Bolivian Cocaine","Chocolate Cake","Soft Baby Kittens","A Marathon of MTV's 'Intervention'","An Internship With Donald Trump","The Person to the Left of You","Professional Video Gaming","SPORTS!","The Concept of Currency","The Knights Templar","A 16 Book Fantasy Series","LEGO Brand Bricks","Pulling an All-Nighter","The Nintendo 64","Bubble Blowing Parties"];
var pastTopics=[];
// Initialize other variables
var gameRef=new Firebase("https://dont-get-me-started.firebaseio.com/");
var listRef=new Firebase("https://dont-get-me-started.firebaseio.com/playerlist");
var isOnlineRef=new Firebase("https://dont-get-me-started.firebaseio.com/presence");
var universalRef=gameRef.child("universal");
var roundWinnerRef=universalRef.child("roundwinner");
var playerHost=false;
var numPlayers=1;
var randomTopic="";
var rant="";
var rantList=[];
var leaderboard=[];
var started=false;

$("#TopicArea").hide();
$("#VotingArea").hide();
//Prompts the user for their UserID and creates their object on the server
var userId=prompt('What is your username?', 'Guest');
var onlineRef=gameRef.child("presence").child(userId);
var playerRef=listRef.child(userId);
playerRef.set({userId:userId,votes:0,rant:"",roundsWon:0,url:"https://dont-get-me-started.firebaseio.com/playerlist/"+userId});

//Logs players off if they go offline
var amOnline=new Firebase("https://dont-get-me-started.firebaseio.com/.info/connected");
amOnline.on('value',function(snapshot){
  if(snapshot.val()){
    onlineRef.onDisconnect().remove();
    playerRef.onDisconnect().remove();
    onlineRef.set(true);}});

//Determines whether a player is the host for the game
function makeHost(listRef){
listRef.limitToFirst(1).on("child_added",function(snapshot){
  var isHost=snapshot.val();
  if(isHost.userId===userId){
    playerRef.update({host:true});
    playerHost=true;
	$("#StartPage").append("<button class='btn btn-warning center-block' id='StartGame'>Start The Round</button>");}
  else if(isHost.userId!=userId){
  	$("#StartGame").hide();
    playerRef.update({host:false});
    playerHost=false;}})}

//Adds/Removes to/from the numPlayers variable when a player joins the game, but only lets them start playing the next round
isOnlineRef.on("value",function(snapshot){
	if(started==false){
		numPlayers=snapshot.numChildren();
		console.log(numPlayers);}})

//Random Topic is chosen for all players and prints to screen
var chooseTopic=function(){
  var topicsRef=new Firebase("https://dont-get-me-started.firebaseio.com/topics");
  if(playerHost==true){
    randomTopic=topics[Math.floor(Math.random()*topics.length)];
    for(var i=-1;i<pastTopics.length||i<10;i++){
      if(randomTopic===pastTopics[i]){
        randomTopic="<h3>"+topics[Math.floor(Math.random()*topics.length)]+"</h3>";
        i=0;}}
      pastTopics.push(randomTopic);
      topicsRef.update({currentTopic:randomTopic});}}

//Starts the timer for turning in a rant
var timerStart=function(){
  var timeLeft=45;
  var count=setInterval(function(){timeLeft--;$("#Timer").html(timeLeft);},1000);
    if(timeLeft===0){
      clearInterval(count);}
  setTimeout(function(){votingRound();$("#Timer").html("TIME UP!");universalRef.update({start:false});},45000);
  setTimeout(function(){playerRef.update({rant:""});$("#RantPreview").html("");$("#Text").empty()},49000);}

//The voting round starts
var votingRound=function(){
  console.log("Hello");
  console.log(rantList);
  var topicsRef=new Firebase("https://dont-get-me-started.firebaseio.com/topics");
  topicsRef.update({currentTopic:""});
  $("#TopicArea").fadeOut(1000);
  for(var i=0;i<rantList.length;i++){
  	console.log("Hello2");
    $("#VotingArea").append(rantList[i]);}
  $("#VotingArea").fadeIn(5000);}

//If the player hits the "SPEAK IT" button, it saves their rant to their player object on the server
$("#SubmitButton").on("click",function(){
	rant=$("#Text").val();
	playerRef.update({rant:rant});
	$("#RantPreview").html("<h4 class='text-center'>"+rant+"</h4>");})
$("#Text").on("keypress",function(e){
	var keycode=(e.keycode?event.keycode:event.which);
	if(keycode=='13'){
		rant=$("#Text").val();
		playerRef.update({rant:rant});
		$("#RantPreview").html(rant);}})

//Pushes every player's rant into an array
listRef.on("value",function(snapshot){
  rantList=[];
  leaderboard=[];
  var voteList=[];
  var votesCast=0;
  var count=1;
  snapshot.forEach(function(childSnapshot){
    var rants=childSnapshot.val();
//Updates the locally stored vote list and counts the total votes. If the total votes is equal to the number of players, then it will announce the winner and update that player's score.
	if(playerHost==true){
	    voteList.push([rants.votes,rants.roundsWon,rants.userId]);
	    votesCast+=rants.votes;
	    if(votesCast>=numPlayers){
	      started=false;
	      voteList.sort(function(a,b){
	        if(a[0]>b[0]){
	          return -1;}
	        if(a[0]<b[0]){
	          return 1;}
	        else{
	          a.push(b[1],b[2]);
	      	  return 0;}});
	      var winnerList="";
	      var roundsWonList=[];
	      for(var i=2;i<voteList[0].length;i+=2){
	      	console.log(winnerList)
	      	console.log(voteList[0]);
	      	if(voteList[0].length>3){
	      		winnerList=voteList[0][i]+" "+winnerList;
	      		var roundsWonRef=new Firebase("https://dont-get-me-started.firebaseio.com/playerlist/"+voteList[0][i]);
	      		universalRef.update({roundwinner:winnerList});
	      		roundsWonRef.update({votes:0});
	      		roundsWonRef.update({roundsWon:voteList[0][i-1]+1});}
	      	else if(voteList[0].length<=3){
	      		var roundsWonRef=new Firebase("https://dont-get-me-started.firebaseio.com/playerlist/"+voteList[0][2]);
	      		universalRef.update({roundwinner:voteList[0][2]});
	      		roundsWonRef.update({votes:0});
	      		roundsWonRef.update({roundsWon:voteList[0][1]+1});}}
	      	$("#StartGame").show();}}
//Updates the leaderboard on the server
	leaderboard.push([rants.userId,rants.roundsWon]);
	if(count==numPlayers){
		$("#Leaderboard").html("<tr><td><b>Players</b></td><td><b>Score</b></td></tr>");
		leaderboard.sort(function(a,b){
			if(a[1]>b[1]){
		        return -1;}
		    if(a[1]<b[1]){
		        return 1;}
		    else{
		    	return 0;}})
		console.log(leaderboard);
		for(var i=0;i<numPlayers;i++){
			$("#Leaderboard").append("<tr><td>"+leaderboard[i][0]+"</td><td>"+leaderboard[i][1]+"</td><b></tr>");}}
//Turns rants into clickable buttons with which you can vote on whilst making certain you do not vote for yourself
    rantList.push("<div class='rant text-center' id='rant"+count+"'><p>"+rants.rant+"</p></div>");
    $("#rant"+count).data("URLForMe",rants.url);
    $("#rant"+count).data("voteForMe",rants.votes);
    $("#rant"+count).data("nameForMe",rants.userId);
    $("#rant"+count).on("click",function(){
      var name=$(this).data("nameForMe");
        if(userId===name){
          alert("You cannot vote for yourself!");}
        else{
          var URL=$(this).data("URLForMe");
          var votesRef=new Firebase(URL);
          var newVotes=$(this).data("voteForMe");
          newVotes++;
          votesRef.update({votes:newVotes});
          $("#VotingArea").html("");}})
      count++;})})

//Allows the host to start the game when all players are present
listRef.on("value",function(snapshot){
  var playersPresent=(snapshot.numChildren());
  $("#StartGame").on("click",function(){
    if(playerHost==true&&playersPresent>=numPlayers&&started==false){
      started=true;
      universalRef.update({start:true});
      chooseTopic();}})})

//Starts the round for all players when the host starts it
universalRef.child("start").on("value",function(snapshot){
  var gameOn=snapshot.val();
  if(gameOn==true){
    playerRef.update({votes:0});
    $("#VotingArea").fadeOut(1000);
    $("#TopicArea").fadeIn(2000);
    timerStart();
	$("#StartGame").hide()}})

//Updates everyone's screens with the current prompt
var currentTopicRef=gameRef.child("topics").child("currentTopic");
  currentTopicRef.on("value",function(snapshot){
    var randomTopic=snapshot.val();
    $("#CardReveal").html("<h2 class='CurrentCard'>"+randomTopic+"</h2>");})

makeHost(listRef);
})