const docsModel = require('./docsModel');
let throttleTimer;

const socketModel = {
    connect: async function (io) {
        io.on("connection", socket => {
            console.log('A user connected');
            socketModel.createRoom(socket);

            socketModel.editDoc(socket);

            socketModel.disconnect(socket);
        });
    },
    createRoom: function (socket) {
        socket.on('create', function(room) {
            console.log(`A user joined room ${room}`);
            socket.join(room);
        });
    },
    editDoc: function (socket) {
        socket.on("editDoc", document => {
            socket.to(document._id).emit("editDoc", document);

            clearTimeout(throttleTimer);
            console.log("Writing");
            throttleTimer = setTimeout(function() {
                console.log("Save to database");
                docsModel.updateDoc(document._id, document.name, document.content);
            }, 2000);
        });
    },
    disconnect: function(socket) {
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    }
};

module.exports = socketModel;
