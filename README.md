DO NOT REFRESH THE PAGE<br>
DO NOT CLICK END VOTING<br>
DO NOT CLICK KILL PLAYER<br>
THESE OPTIONS ARE FOR HOST ONLY<br>
<br>
TO ACCESS, GO TO declan-party.local:3000<br>
<br>
Run "node server.js" in folder with all files<br>
File path is C:/AmongUsVote<br>
index is main page, allows connections to other pages<br>
admin is admin dashboard, meant for display on larger screens<br>
<br>
Note to self:<br>
To add players change add line to this section of script
<code>
const colors=[
  {name:"RED",color:"#C51111"},
  {name:"BLUE",color:"#132FD2"},
  {name:"GREEN",color:"#117F2D"},
  {name:"YELLOW",color:"#F5F557"},
  {name:"PINK",color:"#EC0E63"},
  {name:"ORANGE",color:"#EF7D0D"}
];
</code>
<br>
on server.js, change this section
<code>
let votes = {
  RED:0, BLUE:0, GREEN:0, YELLOW:0, PINK:0, ORANGE:0
};
</code>
