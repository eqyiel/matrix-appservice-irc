"use strict";
var q = require("q");
var matrixLib = require("./mxlib/matrix");

var getIrcUser = function(userId) {

};

var getIrcRoom = function(roomId) {

};

var ircToMatrixMsgType = {
    message: "m.text",
    privmsg: "m.emote",
    notice: "m.notice"
};

module.exports.hooks = {
    matrix: {
        onInvite: function(event) {
            // if this is for a virtual user:
            //  - join the room as the virtual user
            //  - if member list is just the virtual user and the inviter:
            //      - Clobber the PM room with the invited room ID
            //      - Store the PM room (IRC user / Matrix user tuple) forever
            //  - else:
            //      - whine that you don't do group chats and leave.
        },
        onJoin: function(event) {
            // if this is another Matrix user joining a PM room:
            //  - Whine that you don't do group chats and leave (virtual user)
        },
        onMessage: function(event) {
            // if message is in a tracked room, echo to IRC room.
            // if message is in a PM room, PM IRC user (from Matrix user)
            // else complain and send an error back (could be a stale PM room)
            
            // getIrcUser/getIrcRoom creates if necessary.
            // var ircUser = getIrcUser(event.user_id)
            // var ircRoom = getIrcRoom(event.room_id)
            // var ircMsg = getIrcMessage(event) (maps emotes/notices/etc, msg.type, msg.text)
            // ircUser.send(ircRoom, ircMsg)
        },
        onAliasQuery: function(roomAlias) {
            // if alias maps to a valid IRC server and channel:
            //  - create a matrix room
            //  - join the irc server (if haven't already)
            //  - join the channel
            //  - STORE THE NEW DYNAMIC MAPPING FOREVERMORE (so if you get
            //    restarted, you know to track this room)
            //  - respond OK
            return q.reject({});
        },
        onUserQuery: function(userId) {
            // if user ID maps to a valid IRC server and nick:
            //  - register the virtual user ID
            //  - Set display name / IRC-icon
            //  - respond OK
            return q.reject({});
        }
    },
    irc: {
        onMessage: function(server, from, to, kind, msg) {
            console.log("onMessage: from=%s to=%s kind=%s msg=%s",
                from, to, kind, msg);

            // TODO if message is a PM to a Matrix user, send message in PM 
            // room, creating one if need be.

            // Check tracked channels
            var roomId = server.channelToRoomIds[to];
            if (!roomId) {
                console.error("Cannot find room ID for channel %s on %s",
                              to, server.domain);
                return;
            }
            
            var matrixUser = matrixLib.getMatrixUser(server.userPrefix+from);
            var matrixRoom = matrixLib.getMatrixRoom(roomId);
            matrixLib.sendMessage(
                matrixRoom, matrixUser, ircToMatrixMsgType[kind], msg
            );
        }
    }
};