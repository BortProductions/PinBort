const dataGetStatement = "SELECT * FROM server WHERE serverId = $id";
const createTableStatement = "CREATE TABLE IF NOT EXISTS server (serverId TEXT, allowed TEXT, channel TEXT, prefix TEXT)";
const insertRowStatement = "INSERT INTO server (serverId, allowed, channel, prefix) VALUES (?, ?, ?, ?)";
const updatePrefixStatement = "UPDATE server SET prefix = $data WHERE serverId = $id";
const updateChannelStatement = "UPDATE server SET channel = $data WHERE serverId = $id";
const updateAllowedStatement = "UPDATE server SET channel = $data WHERE serverId = $id";

module.exports = {
    effectivelyAllowed: function(user, server, sql, callback) {
        if (user.id === 152559951930327040 || user.id === 256837977169330176) {
            callback(true);
            return;
        }
        if(server.owner.id === user.id){
            callback(true);
            return;
        }
        let check = false;
        server.roles.forEach(function (entry) {
            if (entry.hasPermission('ADMINISTRATOR') || entry.hasPermission('MANAGE_MESSAGES')) {
                entry.members.forEach(function(entry2){
                    if(entry2.id === user.id) {
                        check = true;
                    }
                });
            }
        });
        if(check){
            callback(true);
            return;
        }
        this.rawAllowed(user, server, sql, (isAllowed) => {
            if(isAllowed){
                callback(true);
                return;
            }
            callback(false);
        });
    },
    addAllowed: function(user, server, sql){
        dataGetStatement.setField();
        sql.get(dataGetStatement, {
            $id: server.id,
        }, function (err, row) {
            if(err){
                console.log(err);
                sql.run(createTableStatement, function () {
                    sql.get(dataGetStatement, {
                        $id: server.id,
                    }, function (err, row) {
                        if(!row) {
                            sql.run(insertRowStatement, server.id, [user.id].join());
                        }
                    });
                });
                return;
            }
            let current = [];
            if(row){
                current = row.allowed.split(",");
            }
            current.push(user.id);
            sql.get(updateAllowedStatement, {
                $id: server.id,
                $data: current.join()
            });
        });
    },
    removeAllowed: function(user, server, sql){
        let current;
        sql.get(dataGetStatement, {
            $id: server.id,
        }, function (err, row) {
            if(err){
                console.log(err);
                sql.run(createTableStatement, function () {
                    sql.get(dataGetStatement, {
                        $id: server.id,
                    }, function (err, row) {
                        if(!row) {
                            sql.run(insertRowStatement, server.id);
                        }
                    });
                });
                return;
            }
            current = row.allowed.split(",");
            if(current.includes(user.id)){
                current.pop(user.id);
            }
            sql.run(updateAllowedStatement, {
                $id: server.id,
                $data: current.join()
            })
        });
    },
    rawAllowed: function(user, server, sql, callback) {
        sql.get(dataGetStatement, {
            $id: server.id,
        }, function (err, row) {
            if(err){
                console.log(err);
                sql.run(createTableStatement, function () {
                    sql.get(dataGetStatement, {
                        $id: server.id,
                    }, function (err, row) {
                        if(!row) {
                            sql.run(insertRowStatement, server.id);
                        }
                    });
                });
                return;
            }
            if(row) {
                let returnVal = false;
                row.allowed.split(",").forEach(function (entry) {
                    if (entry === user.id) {
                        returnVal = true;
                    }
                });
                callback(returnVal);
            }
        });
    },
    setChannel: function (store, server, sql) {
        sql.get(dataGetStatement, {
            $id: server.id,
        }, function (err, row) {
            if(err){
                console.log(err);
                sql.run(createTableStatement, function () {
                    sql.get(dataGetStatement, {
                        $id: server.id,
                    }, function (err, row) {
                        if(!row) {
                            sql.run(insertRowStatement, server.id, "", store);
                        }
                    });
                });
                return;
            }
            if(row){
                sql.run(updateChannelStatement, {
                    $id: server.id,
                    $data: store
                });
            }
            else {
                sql.run(insertRowStatement, server.id, "", store);
            }
        });
    },
    getChannel: function (server, sql, callback) {
        sql.get(dataGetStatement, {
            $id: server.id,
        }, function (err, row) {
            if(err){
                console.log(err);
                sql.run(createTableStatement, function () {
                    sql.get(dataGetStatement, {
                        $id: server.id,
                    }, function (err, row) {
                        if(!row) {
                            sql.run(insertRowStatement, server.id);
                        }
                    });
                });
                callback("None");
                return;
            }
            if(row){
                callback(row.channel);
                return;
            }
            callback("None");
        });
    },
    setPrefix: function (prefix, server, sql) {
        sql.get(dataGetStatement, {
            $id: server.id,
        }, function (err, row) {
            if(err){
                console.log(err);
                sql.run(createTableStatement, function (err, row) {
                    sql.get(dataGetStatement, {
                        $id: server.id,
                    }, function (err, row) {
                        if(!row) {
                            sql.run(insertRowStatement, server.id, "?", "?", prefix);
                        }
                    });
                });
                return;
            }
            if(row){
                sql.run(updatePrefixStatement, {
                    $data: prefix,
                    $id: server.id
                });
            }
            else {
                sql.run(insertRowStatement, server.id, "?", "?", prefix);
            }
        });
    },
    getPrefix: function(server, sql, callback){
        sql.get(dataGetStatement, {
            $id: server.id,
        }, function (err, row) {
            if(err){
                console.log(err);
                sql.run(createTableStatement, function (err, row) {
                    sql.run(dataGetStatement, {
                        $id: server.id,
                    }, function (err, row) {
                        if(!row) {
                            sql.run(insertRowStatement, server.id);
                        }
                    })
                });
                callback("*");
                return;
            }
            if(row && row.prefix && row.prefix !== ""){
                callback(row.prefix);
                return;
            }
            callback("*")
        });
    }
};