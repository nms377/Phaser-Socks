const express = require('express');
const app = express();
const OP = require('./public/js/OP');

const { Server : WebSocketServer } = require('ws');
const server = require('http').createServer();
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// "username" => client
const players = new Map();

app.get('/api/hello', (req, res) => {
	const hello = 'world';
	res.json({hello});
});

function clientReceiveMessage( messgae ){
	let msg;
	try{
		msg = OP.parse(message);
	}catch(error){
		console.error(error);
		return this.send(OP.create(OP.ERROR, { error }));
	}

	 // trap unregistered users
  if( this.username === null ){
    // wait for OP:REGISTER
    if( msg.OP === OP.REGISTER ){
      // add the player to players
      if( players.has(msg.payload.username) ){
        // player name is taken
        const error = `username: '${msg.payload.username}' is not available.`;
        this.send(OP.create(OP.ERROR, { error }));
      } else {
        // username is available, register the player
        this.username = msg.payload.username;
        players.set(this.username, this);
        this.send(OP.create(OP.REGISTERACK));
      }
    } else {
      const error = `You are not registered yet. Register with OP:REGISTER first.`;
      this.send(OP.create(OP.ERROR, { error }));
    }
    return; // trap
  }
  
}

wss.on('connection', client => {

	client.username = null;

	client.on('message', clientReceiveMessage.bind(client));

});

server.on('request', app);
server.listen(PORT, _=> 
	console.log('Server listening on ' + server.address().port)
);