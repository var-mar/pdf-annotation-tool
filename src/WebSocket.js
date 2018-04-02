import io from 'socket.io-client';

let client;

export const initws = (mesg) => {
  client = io('http://localhost:8081');

  client.on('connect', function(){
    console.log("Connected to socket.io:8081");
  });
  client.on('event', function(data){});
  client.on('disconnect', function(){});

  return client
}

export const getws = () => {
  return client
}

export const send = (messageID, data) => {
  if(client!=undefined)client.emit(messageID, data);
}
