/**

 Copyright Â© 2014-2017 basicBot

 Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.

 */

(function() {

    API.getWaitListPosition = function(id) {
        if (typeof id === 'undefined' || id === null) {
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for (var i = 0; i < wl.length; i++) {
            if (wl[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    var kill = function() {
        clearInterval(basicBot.room.autodisableInterval);
        clearInterval(basicBot.room.afkInterval);
        basicBot.status = false;
    };

    var storeToStorage = function() {
        localStorage.setItem('basicBotsettings', JSON.stringify(basicBot.settings));
        localStorage.setItem('basicBotRoom', JSON.stringify(basicBot.room));
        var basicBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: basicBot.version
        };
        localStorage.setItem('basicBotStorageInfo', JSON.stringify(basicBotStorageInfo));
    };

    var subChat = function(chat, obj) {
        if (typeof chat === 'undefined') {
            API.chatLog('[Error] Sem resposta do LANG.');
            console.log('[Error] Sem resposta do LANG.');
            return '[Error] Sem resposta do LANG.';

            // TODO: Get missing chat messages from source.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function(cb) {
        if (!cb) cb = function() {};
        $.get('https://api.myjson.com/bins/17dt79.json', function(json) {
            var link = basicBot.chatLink;
            if (json !== null && typeof json !== 'undefined') {
                langIndex = json;
                link = langIndex[basicBot.settings.language.toLowerCase()];
                if (basicBot.settings.chatLink !== basicBot.chatLink) {
                    link = basicBot.settings.chatLink;
                } else {
                    if (typeof link === 'undefined') {
                        link = basicBot.chatLink;
                    }
                }
                $.get(link, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        basicBot.chat = json;
                        cb();
                    }
                });
            } else {
                $.get(basicBot.chatLink, function(json) {
                    if (json !== null && typeof json !== 'undefined') {
                        if (typeof json === 'string') json = JSON.parse(json);
                        basicBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function() {
        var settings = JSON.parse(localStorage.getItem('basicBotsettings'));
        if (settings !== null) {
            for (var prop in settings) {
                basicBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function() {
        var info = localStorage.getItem('basicBotStorageInfo');
        if (info === null) API.chatLog(basicBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem('basicBotsettings'));
            var room = JSON.parse(localStorage.getItem('basicBotRoom'));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(basicBot.chat.retrievingdata);
                for (var prop in settings) {
                    basicBot.settings[prop] = settings[prop];
                }
                basicBot.room.users = room.users;
                basicBot.room.afkList = room.afkList;
                basicBot.room.historyList = room.historyList;
                basicBot.room.mutedUsers = room.mutedUsers;
                //basicBot.room.autoskip = room.autoskip;
                basicBot.room.roomstats = room.roomstats;
                basicBot.room.messages = room.messages;
                basicBot.room.queue = room.queue;
                basicBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(basicBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById('room-settings');
        info = roominfo.textContent;
        var ref_bot = '@basicBot=';
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(' ') < link.indexOf('\n')) ind_space = link.indexOf(' ');
            else ind_space = link.indexOf('\n');
            link = link.substring(0, ind_space);
            $.get(link, function(json) {
                if (json !== null && typeof json !== 'undefined') {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        basicBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function(a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            } else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
        return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = 'Yemasthui';
    var botMaintainer = '-gαℓαxy';
    var botCreatorIDs = [000000, 000000, 000000, 000000];
    var botHostIDs = [000000];
    var botRDJIDs = [000000];

    var basicBot = {
        version: '8.0 (10/10)',
        status: false,
        name: '-gαℓαxy',
        loggedInID: null,
        scriptLink: 'https://rawgit.com/basicBot/source/master/basicBot.js',
        cmdLink: '',
        chatLink: 'https://rawgit.com/GalaxyDELAS/BOT-2018/master/lang/pt-BR.json',
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: '-gαℓαxy',
            language: 'portuguese',
            chatLink: 'https://rawgit.com/GalaxyDELAS/BOT-2018/master/lang/pt-BR.json',
            scriptLink: 'https://rawgit.com/basicBot/source/master/basicBot.js',
            roomLock: false, // Requires an extension to re-load the script
            startupCap: 1, // 1-200
            startupVolume: 70, // 0-100
            startupEmoji: true, // true or false
            usersMute: [],
	    duelDelay: 30,
	    songCounter: 0,
	    apocalyse: false,
	    admins: [12601578],
	    apoc: ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","r","s","t","u","v","w","x","y","z","1","2","3","4","5","6","7","8","9","0"],		
	    lottery: true,
	    globCounter: 0,
	    lotWinner: null,
	    lotWinners: [],
	    lot: 0,
	    duel: [],
	    duelReady: true,
	    motd: [""],
	    songURL : null,
	    songInfo : null,
	    lotWinner: null,
	    launchTime: Date.now(),
            ss: false,
            ed: false,
            autoroletaEnabled: false,
            autoroletaInterval: 6,
            autoRoleta: "!roleta",
            roletapos: 2,
            autowoot: true,
            autoskip: false,
            smartSkip: true,
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: false,
            maximumDc: 60,
            bouncerPlus: true,
            rdjPlus: false,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: false,
            timeGuard: true,
            maximumSongLength: 7,
            autodisable: false,
            commandCooldown: 1,
            usercommandsEnabled: true,
            djCommand: true,
            djCooldown: 10,
            dropCommand: true,
            dropCooldown: 10,
            skipPosition: 1,
            skipReasons: [
                ['theme', 'This song does not fit the room theme. '],
                ['op', 'This song is on the OP list. '],
                ['history', 'This song is in the history. '],
                ['mix', 'You played a mix, which is against the rules. '],
                ['sound', 'The song you played had bad sound quality or no sound. '],
                ['nsfw', 'The song you contained was NSFW (image or sound). '],
                ['unavailable', 'The song you played was not available for some users. ']
            ],
            afkpositionCheck: 15,
            afkRankCheck: 'ambassador',
            motdEnabled: false,
            motdInterval: 5,
            motd: 'Temporary Message of the Day',
            filterChat: false,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: 'https://goo.gl/NamtYN',
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: '!',
            blacklists: {
                NSFW: 'https://rawgit.com/basicBot/custom/master/blacklists/NSFWlist.json',
                OP: 'https://rawgit.com/basicBot/custom/master/blacklists/OPlist.json',
                BANNED: 'https://rawgit.com/basicBot/custom/master/blacklists/BANNEDlist.json'
            }
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function() {
                if (basicBot.status && basicBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function() {}, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function() {
                    basicBot.room.roulette.rouletteStatus = true;
                    basicBot.room.roulette.countdown = setTimeout(function() {
                        basicBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(subChat(basicBot.chat.isopen, {
                        pos: basicBot.settings.roletapos
                    }));
                },
                endRoulette: function() {
                    basicBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * basicBot.room.roulette.participants.length);
                    var winner = basicBot.room.roulette.participants[ind];
                    basicBot.room.roulette.participants = [];
                    var pos = basicBot.settings.roletapos;
                    var user = basicBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(basicBot.chat.winnerpicked, {
                        name: name,
                        position: pos
                    }));
                    setTimeout(function(winner, pos) {
                        basicBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            },
	timeouts: {		
		lotSelect: undefined
	},
	intervals: {
		globCounter: undefined
	},
	userData: {},
	tools: {
		chat : function(data){
			var split = data.message.split(' '),
				cmd = split[0].substring(1).toLowerCase();
			
			if (split[0].indexOf('!')!=0)
				return;
			   
			if (IPB.commands.hasOwnProperty(cmd)){
				IPB.commands[cmd](data,split);
			}
			if(IPB.settings.usersMute.indexOf(data.un) > -1) API.moderateDeleteChat(data.chatid);

			for(var i = 0; i < IPB.settings.apoc.length; i++){
				if(data.message.indexOf(IPB.settings.apoc[i].toLowerCase()) > -1 && IPB.settings.apocalypse){
					API.moderateDeleteChat(data.cid);
				}
			}
		},
		adv: function(data){
			if (!data || !data.songInfo || data.startTime > 0)	return;
			
			var dj = API.getDJ().username;
			var songTime = API.getTimeRemaining();
			$('#woot').click();
			
			data.user=API.getDJ();
			
			if (IPB.settings.checkMedia){
				if (data.songInfo.type=='youtube'){
					$.get('https://www.googleapis.com/youtube/v3/videos?id='+data.songInfo.fkid+'&part=snippet,contentDetails,statistics,status&key=AIzaSyDg9pSV0Tkbq8fo7I1z_gz4oVN0IZ3TeHw',
					function(res){IPB.tools.ytCheck(res,data);})
					.error(function(err){
						IPB.tools.ytCheck(undefined,data);
					});
				}else{
					var req = SC.get('/tracks', {ids: data.songInfo.fkid});
					req.request.onload=function(){IPB.tools.scCheck(req._result,data);};
				}
			}
		},
		scCheck : function(data,obj){
			IPB.misc.songInfo=null;
			if (!data || !obj || !obj.user)
				return API.sendChat('[Erro] Falha ao obter informações sobre a música.');
			
			if (!data.length){
				API.sendChat('[@'+obj.un+'] música indisponível, você será pulado e movido para primeiro na lista de espera!');
				return API.moderateSkip(function(){API.moderateMoveDJ(obj.uid,1);});
			}
			
			for (var i in data){
				var song = data[i];

				var title = song.title,
					genre = song.genre,
					fc = IPB.tools.formatNumber(song.favoritings_count),
					pc = IPB.tools.formatNumber(song.playback_count),
					username = song.username,
					dc = IPB.tools.formatNumber(song.download_count);
				
				IPB.misc.songURL = song.permalink_url;
				
				IPB.misc.songInfo = 'Tocando no momento: '+username+' - '+title+' (reproduções: '+pc+', :star:: '+fc+', gênero: '+genre+', downloads: '+dc+', enviada em: '+song.created_at+')';
				
				if (IPB.settings.showMediaInfo)
					API.sendChat(IPB.misc.songInfo);
				
				break;
			}
		},
		 getUserByName: function(name){
        		for(var i in API.getUsers()) {
            			if (API.getUsers()[i].username === name.trim()) return API.getUsers()[i].id;
        		}
    		},
		globCounter: function() {
			IPB.intervals.globCounter = setInterval(function () {
				IPB.settings.globCounter++;
				if (!(IPB.settings.globCounter % 60) && IPB.settings.lottery && Date.now() - IPB.misc.launchTime >= 1e3 * 60 * 20) IPB.tools.boostLottery();
			}, 6e4)
		},
		boostLottery: function() {
			var e = API.getWaitList();
			e.shift();
			var t = e.length,
			r = e[Math.floor(Math.random() * t)];

			if (r) {
				var user = API.getUser(r.id);
				IPB.settings.lotWinners.push(user.id);
				IPB.settings.lotWinner = user.id;
				IPB.timeouts.lotSelect = setTimeout(IPB.tools.boostLottery, 1e3 * 120);
				API.sendChat("@" + user.un + ' Você ganhou a loteria! Antes de 2 minutos, digite !lottery para ser movido a posição 1. Caso o contrário, será sorteado outro usuário.');
			} else API.sendChat("Infelizmente, ninguem estava possibilitado para ganhar a loteria!( ou alguma coisa ruim aconteceu!) Será sorteado um novo ganhador, então fique ativo no chat!")
		},
		save: function() {
			var t = {
				settings: IPB.settings
			};
			localStorage.setItem("IPBData", JSON.stringify(t));
			console.log('[IPB] Configurações do IPB Salvas.');
		},
		load: function() {
			t = JSON.parse(localStorage.getItem("IPBData"));
			IPB.settings = t.settings;
		},
		loadStorage: function() {
			if(localStorage.getItem("IPBData") !== null){
				IPB.tools.load();
			}else{
				IPB.tools.save();
			}
		},
		formatNumber : function(num) {
			return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
		},
		SecondsToHMS: function(d) {
			d = Number(d);
			var h = Math.floor(d / 3600);
			var m = Math.floor(d % 3600 / 60);
			var s = Math.floor(d % 3600 % 60);
			return ((h > 0 ? (h >= 10 ? h : '0' + h): '00') + ':' + (m > 0 ? (m >= 10 ? m : '0' + m): '00') + ':' + (s > 0 ? (s >= 10 ? s : '0' + s): '00')  );                      
		},
		lockskip: function() {
			var id = API.getDJ().id;
			API.moderateSkip(function(){API.moderateMoveDJ(id, 1);});
		},
		cleanString: function(string) {
			return string.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&#34;/g, "\"").replace(/&#59;/g, ";").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		},
		kill : function(){
			API.off(API.CHAT, IPB.tools.chat);
			API.off(API.ADVANCE, IPB.tools.adv);
			
			Object.keys(IPB.timeouts).forEach(function(k){
				clearTimeout(IPB.timeouts[k]);
			});
			Object.keys(IPB.intervals).forEach(function(k){
				clearInterval(IPB.intervals[k]);
			});
		}
	},
	commands: {
		ping: function(data, split){
			API.sendChat('[' + data.un + '] Pong!');
		},
		skip: function(data, split){
			if(API.getUser(data.uid).role >= 2 || IPB.settings.admins.indexOf(data.uid) > -1){
				API.sendChat('[' + data.un + '] Usou Skip');
				API.moderateSkip();
			}else{
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
		},
		mute: function(data, split){
			if(API.getUser(data.uid).role >= 2 || IPB.settings.admins.indexOf(data.uid) > -1){
				var name = data.message.substring(7);
				var user1 = API.getUser(data.uid).role || IPB.settings.admin.indexOf(data.uid) > -1;
				var user2 = IPB.tools.getUserByName(name).role || IPB.settings.admin.indexOf(data.uid) > -1;
				if(user1 > user2){
					if(IPB.settings.usersMute.indexOf(name) > -1){
					   API.sendChat('[' + data.un + '] Usuario já está mutado.');
					}else{
					   IPB.settings.usersMute.push(name);
					   API.sendChat('[' + data.un + '] Usuario: @' + name + ' Mutado.');
					}
				} else {
					API.sendChat('@' + data.un + ' Você não pode mutar usuarios com rank maior ou igual ao o seu!');
				}
			}else{
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
		},
		unmute: function(data, split){
			if(API.getUser(data.uid).role >= 2 || IPB.settings.admins.indexOf(data.uid) > -1){
				var name = data.message.substring(9);
				IPB.settings.usersMute.splice(name);
				API.sendChat('[' + data.un + '] Usuario: @' + name + ' Desmutado.');
			}
			if(split[1] == 'all') {
				if(API.getUser(data.uid).role >= 4 || IPB.settings.admins.indexOf(data.uid) > -1){
					IPB.settings.usersMute = [];
				}
			} 
		},
		duel: function(data, split){
			if (IPB.misc.duelReady && IPB.misc.duel[0] === undefined && IPB.tools.getUserByName(data.message.substr(7)) !== data.uid){
					if (IPB.tools.getUserByName(data.message.substr(7))){
						IPB.misc.duel.push(data.uid);
						IPB.misc.duel.push(IPB.tools.getUserByName(data.message.substr(7)).id);
						API.sendChat('@' + data.message.substr(7) + ', ' + data.un + '  Te chamou para o x1! Antes de dois minutos digite !accept para aceitar o x1. AVISO o perdedor ficará mutado por 2 minutos!');
						setTimeout(function(){
							IPB.misc.duel = [];
						}, 120e3);
					} else {
						API.sendChat('[' + data.un + '] Usuário Invalido! Modo de usar: !duel @usuário');
					}
			}
		},
		accept: function(data, split){
			if(data.uid === IPB.misc.duel[1]){
				API.sendChat(API.getUser(IPB.misc.duel[0]).username + ' and ' + API.getUser(IPB.misc.duel[1]).username + ' comeÃ§aram o duel!');
				var win = Math.round(Math.random());
				win === 0 ? lose = 1 : lose = 0;
				var winner = IPB.misc.duel[win];
				var loser = IPB.misc.duel[lose];
				setTimeout(function(){
					API.sendChat(API.getUser(winner).username + ' Ganhou o x1! Isso quer dizer que ' + API.getUser(loser).username + ' vai ficar mutado por 2 minutos!');
					IPB.misc.duelReady = false;
					IPB.settings.usersMute.push(API.getUser(loser).username);
					setTimeout(function(){IPB.settings.usersMute.splice(API.getUser(loser).username);}, 120e3);
					setTimeout(function(){IPB.misc.duelReady = true}, IPB.settings.duelDelay * 1e3);
					IPB.misc.duel = [];
				}, 5000);
			}
		},
		reject: function(data, split) {
			if (data.uid === IPB.misc.duel[1]){
				IPB.misc.duel = [];
				IPB.misc.duelReady = true;
				API.sendChat(data.un + ' Não aceitou o duelo.');
			}
		},
		lockskip: function(data, split) {
			if(API.getUser(data.uid).role >= 2 || IPB.settings.admins.indexOf(data.uid) > -1){
				var id = API.getDJ().id;
				API.sendChat('[' + data.un + '] Usou Lockskip!')
				API.moderateSkip(function(){API.moderateMoveDJ(id, 1);});
			} else {
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
		},
		move: function(data, split) {
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				var firstSpace = data.message.indexOf(' ');
				var lastSpace = data.message.lastIndexOf(' ');

				var pos;
				var name;

				if (isNaN(parseInt(data.message.substring(lastSpace + 1)))) {
					pos = 1;
					name = data.message.substring(7);
				}else{
					pos = parseInt(data.message.substring(lastSpace + 1));
					name = data.message.substring(7, lastSpace);
				}
				var user = IPB.tools.getUserByName(name);
				if (typeof user === 'boolean') return API.sendChat('[' + data.un + '] Usuário Invalido.');
				if (!isNaN(pos)) {
					API.sendChat('[' + data.un + '] Movendo ' + name + ' para a posição: ' + pos + '.');
					API.moderateMoveDJ(user.id, pos);
				} else return API.sendChat('[' + data.un + '] Posição Invalida!');
			} else {
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
		},
		apocalypse: function(data, split) {
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				IPB.settings.apocalypse = !IPB.settings.apocalypse;

				if(IPB.settings.apocalypse === true) {
					API.sendChat(data.un + ' Chamou o apocalypse.');
				}
				if(IPB.settings.apocalypse === false) {
					API.sendChat(data.un + ' Deu fim ao apocalypse.')
				}

			} else {
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
			IPB.tools.save();
		},
		startlottery: function(data, split) {
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				API.sendChat('[' + data.un + '] A loteria vai sortear em 5 minutos! esteja ativo no chat para participar!');
				setTimeout(IPB.tools.boostLottery, 300e3);
			} else {
				API.sendChat('@' + data.un + ' VocÃª não tem permissão para usar este comando!');
			}
		},
		boostlottery: function(data, split) {
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				IPB.settings.lottery = !IPB.settings.lottery;
				if (IPB.settings.lottery) API.sendChat('[' + data.un + '] Bonus da loteria ativo. A cada hora um usuário ativo tem a chance de ganhar a posição 1 como prêmio na lista de espera!');
				else {
					API.sendChat('[' + data.un + '] Loteria Desativada!');
					clearTimeout(IPB.timeouts.lotSelect)
				}
			} else {
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
			IPB.tools.save();
		},
		lottery: function(data, split) {
			if (IPB.settings.lottery && data.uid == IPB.settings.lotWinner) {
				check = true;
				if (check) {
					IPB.settings.lotWinner = null;
					clearTimeout(IPB.timeouts.lotSelect);
					IPB.settings.lotWinners.length = 0;
					++IPB.settings.lot;
						API.moderateMoveDJ(data.uid, 5);
						API.sendChat('[' + data.un + '] Movendo o ganhador da loteria para a posição 1.');
				}
			}
		},
		lotsync: function(data, split) {
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				IPB.settings.globCounter = (new Date).getMinutes();
				API.sendChat('[' + data.un + '] Loteria sincronizada com o tempo atual. A Loteria vai ocorrer a cada hora!. (:00)')
			} else {
				API.sendChat('@' + data.un + ' Você não tem permissÃ£o para usar este comando!');
			}
		},
		lotreset: function(data, split) {
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				IPB.settings.globCounter = 0;
				API.sendChat('[' + data.un + '] Loteria Resetada! a próxima rodada será nos próximos 60 minutos.');
			} else {
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
		},
		kill: function(data, split){
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				API.sendChat('Shutting Down!');
				IPB.tools.save();
				IPB.tools.kill();
			} else {
				API.sendChat('@' + data.un + ' Você não tem permissão para usar este comando!');
			}
		},
		reload: function(data, split) {
			if(API.getUser(data.uid).role >= 3 || IPB.settings.admins.indexOf(data.uid) > -1){
				API.sendChat('Reloading...');
				IPB.tools.save();
				IPB.tools.kill();
				setTimeout(function(){
					$.getScript('');
				}, 5e2);
			} else {
				API.sendChat('@' + data.un + ' You have no permission to execute this command!');
			}
		},
		commands: function(data, split) {
			API.sendChat('[' + data.un + '] ' + IPB.misc.commands);
		},
		eta: function(data, split) {
			var wl = API.getWaitList();
			var wlp = API.getWaitListPosition(data.uid);
			var tempoRes=API.getTimeRemaining();
			if(wlp === -1) {
				return API.sendChat('@' + data.un + ' You are not in queue.');
			}
			for (var i = 0; i < wlp; i++){
				tempoRes+= ~~(wl[i].songLength/1e3);
			}
			API.sendChat("[" + data.un + "]" + " ETA is " + IPB.tools.SecondsToHMS(tempoRes));
		},
	}
};
	
function StartUp(){
	API.sendChat('/em IgorPlugBot ' + IPB.misc.versao + ' Now Running!');

	API.on(API.CHAT, IPB.tools.chat);		
	API.on(API.ADVANCE, IPB.tools.adv);
    IPB.settings.globCounter = (new Date).getMinutes();
    IPB.tools.globCounter();
}

API.moderateDeleteChat = function(cid){
	$.ajax({
		url: 'https://stg.plug.dj/chat/' + cid,
		type: 'DELETE'
	})
}

StartUp();  
                }
            },
 
            roulettepp: {
				rouletteStatus: false,
				participants: [],
				countdown: null,
				startRoulette: function () {
					basicBot.room.roulettepp.rouletteStatus = true;
					basicBot.room.roulettepp.countdown = setTimeout(function () {
						basicBot.room.roulettepp.endRoulette();
					}, 60 * 1000);
					setTimeout(function () {
						API.sendChat(basicBot.chat.isopenpp);
					}, 1 * 1000);
					setTimeout(function () {
						API.sendChat(basicBot.chat.isopenpp2);
					}, 2 * 1000);
				},
				endRoulette: function () {
					basicBot.room.roulettepp.rouletteStatus = false;
					var user = {};
					var winner = 0;

					while (!user.username && basicBot.room.roulettepp.participants.length > 0) {
						var ind = Math.floor(Math.random() * basicBot.room.roulettepp.participants.length);
						winner = basicBot.room.roulettepp.participants[ind];

						user = basicBot.userUtilities.lookupUser(winner) || API.getUser(winner);

						if (!user.username) {
							basicBot.room.roulettepp.participants.splice(ind, 1);
						}
					}
					basicBot.room.roulettepp.participants = [];

					var name = user.username;
					API.sendChat(subChat(basicBot.chat.winnerpickedpp, {name: name}));
				}
			},
            usersUsedDj: [],
            usersUsedDrop: []
        },
        User: function(id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function(user) {
                return user.jointime;
            },
            getUser: function(user) {
                return API.getUser(user.id);
            },
            updatePosition: function(user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function(user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = basicBot.room.roomstats.songCount;
            },
            setLastActivity: function(user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function(user) {
                return user.lastActivity;
            },
            getWarningCount: function(user) {
                return user.afkWarningCount;
            },
            setWarningCount: function(user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function(id) {
                for (var i = 0; i < basicBot.room.users.length; i++) {
                    if (basicBot.room.users[i].id === id) {
                        return basicBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function(name) {
                for (var i = 0; i < basicBot.room.users.length; i++) {
                    var match = basicBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return basicBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function(id) {
                var user = basicBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function(obj) {
                var u;
                if (typeof obj === 'object') u = obj;
                else u = API.getUser(obj);
                if (botCreatorIDs.indexOf(u.id) > -1) return 9999;

                if (u.gRole == 0) return u.role;
                else {
                    switch (u.gRole) {
                        case 3:
                        case 3000:
                            return (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        case 5:
                        case 5000:
                            return (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                    }
                }
                return 0;
            },
            moveUser: function(id, pos, priority) {
                var user = basicBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function(id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    } else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < basicBot.room.queue.id.length; i++) {
                            if (basicBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            basicBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(basicBot.chat.alreadyadding, {
                                position: basicBot.room.queue.position[alreadyQueued]
                            }));
                        }
                        basicBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            basicBot.room.queue.id.unshift(id);
                            basicBot.room.queue.position.unshift(pos);
                        } else {
                            basicBot.room.queue.id.push(id);
                            basicBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(basicBot.chat.adding, {
                            name: name,
                            position: basicBot.room.queue.position.length
                        }));
                    }
                } else API.moderateMoveDJ(id, pos);
            },
            dclookup: function(id) {
                var user = basicBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return basicBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(basicBot.chat.notdisconnected, {
                    name: name
                });
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return basicBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (basicBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = basicBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(basicBot.chat.toolongago, {
                    name: basicBot.userUtilities.getUser(user).username,
                    time: time
                }));
                var songsPassed = basicBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = basicBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(basicBot.chat.notdisconnected, {
                    name: name
                });
                var msg = subChat(basicBot.chat.valid, {
                    name: basicBot.userUtilities.getUser(user).username,
                    time: time,
                    position: newPosition
                });
                basicBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function(rankString) {
                var rankInt = null;
                switch (rankString) {
                    case 'admin':
                        rankInt = 10;
                        break;
                    case 'ambassador':
                        rankInt = 7;
                        break;
                    case 'host':
                        rankInt = 5;
                        break;
                    case 'cohost':
                        rankInt = 4;
                        break;
                    case 'manager':
                        rankInt = 3;
                        break;
                    case 'bouncer':
                        rankInt = 2;
                        break;
                    case 'residentdj':
                        rankInt = 1;
                        break;
                    case 'user':
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function(msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function() {}, 1000),
                locked: false,
                lockBooth: function() {
                    API.moderateLockWaitList(!basicBot.roomUtilities.booth.locked);
                    basicBot.roomUtilities.booth.locked = false;
                    if (basicBot.settings.lockGuard) {
                        basicBot.roomUtilities.booth.lockTimer = setTimeout(function() {
                            API.moderateLockWaitList(basicBot.roomUtilities.booth.locked);
                        }, basicBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function() {
                    API.moderateLockWaitList(basicBot.roomUtilities.booth.locked);
                    clearTimeout(basicBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function() {
                if (!basicBot.status || !basicBot.settings.afkRemoval) return void(0);
                var rank = basicBot.roomUtilities.rankToNumber(basicBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, basicBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void(0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = basicBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = basicBot.userUtilities.getUser(user);
                            if (rank !== null && basicBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = basicBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = basicBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > basicBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(basicBot.chat.warning1, {
                                            name: name,
                                            time: time
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    } else if (warncount === 1) {
                                        API.sendChat(subChat(basicBot.chat.warning2, {
                                            name: name
                                        }));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function(userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    } else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            basicBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(basicBot.chat.afkremove, {
                                                name: name,
                                                time: time,
                                                position: pos,
                                                maximumafk: basicBot.settings.maximumAfk
                                            }));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function(reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                basicBot.room.queueable = false;

                if (waitlistlength == 50) {
                    basicBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function(id) {
                    API.moderateForceSkip();
                    setTimeout(function() {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    basicBot.room.skippable = false;
                    setTimeout(function() {
                        basicBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function(id) {
                        basicBot.userUtilities.moveUser(id, basicBot.settings.skipPosition, false);
                        basicBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function() {
                                basicBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function() {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks if shouldCycle is true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(basicBot.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (basicBot.settings.cycleGuard) { // Is cycle guard on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                            basicBot.room.cycleTimer = setTimeout(function() { // Start timer
                                API.moderateDJCycle(false); // Disable cycle
                            }, basicBot.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                            API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function() {
                var interval;
                if (basicBot.settings.motdEnabled) interval = basicBot.settings.motdInterval;
                else interval = basicBot.settings.messageInterval;
                if ((basicBot.room.roomstats.songCount % interval) === 0 && basicBot.status) {
                    var msg;
                    if (basicBot.settings.motdEnabled) {
                        msg = basicBot.settings.motd;
                    } else {
                        if (basicBot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = basicBot.room.roomstats.songCount % basicBot.settings.intervalMessages.length;
                        msg = basicBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            roletaintervalMessage: function() {
                var interval;
                if (basicBot.settings.autoroletaEnabled) interval = basicBot.settings.autoroletaInterval;
                else interval = basicBot.settings.messageInterval;
                if ((basicBot.room.roomstats.songCount % interval) === 0 && basicBot.status) {
                    var msg;
                    if (basicBot.settings.autoroletaEnabled) {
                        msg = basicBot.settings.autoRoleta;
                    } else {
                        if (basicBot.settings.intervalMessages.length === 0) return void(0);
                        var messageNumber = basicBot.room.roomstats.songCount % basicBot.settings.intervalMessages.length;
                        msg = basicBot.settings.intervalMessages[messageNumber];
                    }
                    API.chatLog('/me ' + msg);
                }
            },
            updateBlacklists: function() {
                for (var bl in basicBot.settings.blacklists) {
                    basicBot.room.blacklists[bl] = [];
                    if (typeof basicBot.settings.blacklists[bl] === 'function') {
                        basicBot.room.blacklists[bl] = basicBot.settings.blacklists();
                    } else if (typeof basicBot.settings.blacklists[bl] === 'string') {
                        if (basicBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function(l) {
                                $.get(basicBot.settings.blacklists[l], function(data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    basicBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        } catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function() {
                if (typeof console.table !== 'undefined') {
                    console.table(basicBot.room.newBlacklisted);
                } else {
                    console.log(basicBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function() {
                var list = {};
                for (var i = 0; i < basicBot.room.newBlacklisted.length; i++) {
                    var track = basicBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function(chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();

            basicBot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === chat.uid) {
                    basicBot.userUtilities.setLastActivity(basicBot.room.users[i]);
                    if (basicBot.room.users[i].username !== chat.un) {
                        basicBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (basicBot.chatUtilities.chatFilter(chat)) return void(0);
            if (!basicBot.chatUtilities.commandCheck(chat))
                basicBot.chatUtilities.action(chat);
        },
        eventUserjoin: function(user) {
            var known = false;
            var index = null;
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                basicBot.room.users[index].inRoom = true;
                var u = basicBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            } else {
                basicBot.room.users.push(new basicBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < basicBot.room.users.length; j++) {
                if (basicBot.userUtilities.getUser(basicBot.room.users[j]).id === user.id) {
                    basicBot.userUtilities.setLastActivity(basicBot.room.users[j]);
                    basicBot.room.users[j].jointime = Date.now();
                }

            }

            if (botHostIDs.indexOf(user.id) > -1) {
              console.log(true);
                API.sendChat('@'+user.username+' '+'Musa do Plug e Rainha da EDM & Indie acaba de entrar na sala. :crown:');
            } else if (basicBot.settings.welcome && greet) {
              console.log(false);
              console.log(botHostIDs);
                welcomeback ?
                    setTimeout(function(user) {
                        API.sendChat(subChat(basicBot.chat.welcomeback, {
                            name: user.username
                        }));
                    }, 1 * 1000, user) :
                    setTimeout(function(user) {
                        API.sendChat(subChat(basicBot.chat.welcome, {
                            name: user.username
                        }));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function(user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    basicBot.userUtilities.updateDC(basicBot.room.users[i]);
                    basicBot.room.users[i].inRoom = false;
                    if (lastDJ == user.id) {
                        var user = basicBot.userUtilities.lookupUser(basicBot.room.users[i].id);
                        basicBot.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function(obj) {
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        basicBot.room.users[i].votes.woot++;
                    } else {
                        basicBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
            var timeElapsed = API.getTimeElapsed();

            if (basicBot.settings.voteSkip) {
                if ((mehs - woots) >= (basicBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(basicBot.chat.voteskipexceededlimit, {
                        name: dj.username,
                        limit: basicBot.settings.voteSkipLimit
                    }));
                    if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                        basicBot.roomUtilities.smartSkip();
                    } else {
                        API.moderateForceSkip();
                    }
                }
            }

        },
        eventCurateupdate: function(obj) {
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === obj.user.id) {
                    basicBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function(obj) {
            if (basicBot.settings.autowoot) {
                $('#woot').click(); // autowoot
            }

            var user = basicBot.userUtilities.lookupUser(obj.dj.id)
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    basicBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (basicBot.settings.songstats) {
                if (typeof basicBot.chat.songstatistics === 'undefined') {
                    API.sendChat('/me ' + lastplay.media.author + ' - ' + lastplay.media.title + ': ' + lastplay.score.positive + 'W/' + lastplay.score.grabs + 'G/' + lastplay.score.negative + 'M.')
                } else {
                    API.sendChat(subChat(basicBot.chat.songstatistics, {
                        artist: lastplay.media.author,
                        title: lastplay.media.title,
                        woots: lastplay.score.positive,
                        grabs: lastplay.score.grabs,
                        mehs: lastplay.score.negative
                    }))
                }
            }
            basicBot.room.roomstats.totalWoots += lastplay.score.positive;
            basicBot.room.roomstats.totalMehs += lastplay.score.negative;
            basicBot.room.roomstats.totalCurates += lastplay.score.grabs;
            basicBot.room.roomstats.songCount++;
            basicBot.roomUtilities.intervalMessage();
            basicBot.roomUtilities.roletaintervalMessage();
            basicBot.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function() {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in basicBot.room.blacklists) {
                    if (basicBot.settings.blacklistEnabled) {
                        if (basicBot.room.blacklists[bl].indexOf(mid) > -1) {
                            API.sendChat(subChat(basicBot.chat.isblacklisted, {
                                blacklist: bl
                            }));
                            if (basicBot.settings.smartSkip) {
                                return basicBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                }
            }, 2000);
            var newMedia = obj.media;
            var timeLimitSkip = setTimeout(function() {
                if (basicBot.settings.timeGuard && newMedia.duration > basicBot.settings.maximumSongLength * 60 && !basicBot.room.roomevent) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(basicBot.chat.timelimit, {
                        name: name,
                        maxlength: basicBot.settings.maximumSongLength
                    }));
                    if (basicBot.settings.smartSkip) {
                        return basicBot.roomUtilities.smartSkip();
                    } else {
                        return API.moderateForceSkip();
                    }
                }
            }, 2000);
            var format = obj.media.format;
            var cid = obj.media.cid;
            var naSkip = setTimeout(function() {
                if (format == 1) {
                    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function(track) {
                        if (typeof(track.items[0]) === 'undefined') {
                            var name = obj.dj.username;
                            API.sendChat(subChat(basicBot.chat.notavailable, {
                                name: name
                            }));
                            if (basicBot.settings.smartSkip) {
                                return basicBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                } else {
                    var checkSong = SC.get('/tracks/' + cid, function(track) {
                        if (typeof track.title === 'undefined') {
                            var name = obj.dj.username;
                            API.sendChat(subChat(basicBot.chat.notavailable, {
                                name: name
                            }));
                            if (basicBot.settings.smartSkip) {
                                return basicBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
            }, 2000);
            clearTimeout(historySkip);
            if (basicBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function() {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            basicBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(basicBot.chat.songknown, {
                                name: name
                            }));
                            if (basicBot.settings.smartSkip) {
                                return basicBot.roomUtilities.smartSkip();
                            } else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        basicBot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(basicBot.chat.permissionownsong, {
                    name: user.username
                }));
                user.ownSong = false;
            }
            clearTimeout(basicBot.room.autoskipTimer);
            if (basicBot.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid;
                basicBot.room.autoskipTimer = setTimeout(function() {
                    var endcid = API.getMedia().cid;
                    if (startcid === endcid) {
                        //API.sendChat('Song stuck, skipping...');
                        API.moderateForceSkip();
                    }
                }, remaining + 5000);
            }
            storeToStorage();
            //sendToSocket();
        },
        eventWaitlistupdate: function(users) {
            if (users.length < 50) {
                if (basicBot.room.queue.id.length > 0 && basicBot.room.queueable) {
                    basicBot.room.queueable = false;
                    setTimeout(function() {
                        basicBot.room.queueable = true;
                    }, 500);
                    basicBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function() {
                            id = basicBot.room.queue.id.splice(0, 1)[0];
                            pos = basicBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function(id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    basicBot.room.queueing--;
                                    if (basicBot.room.queue.id.length === 0) setTimeout(function() {
                                        basicBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + basicBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = basicBot.userUtilities.lookupUser(users[i].id);
                basicBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function(chat) {
            if (!basicBot.settings.filterChat) return false;
            if (basicBot.userUtilities.getPermission(chat.uid) >= API.ROLE.BOUNCER) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(basicBot.chat.caps, {
                    name: chat.un
                }));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(basicBot.chat.askskip, {
                    name: chat.un
                }));
                return true;
            }
            for (var j = 0; j < basicBot.chatUtilities.spam.length; j++) {
                if (msg === basicBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(basicBot.chat.spam, {
                        name: chat.un
                    }));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function(chat) {
                var msg = chat.message;
                var perm = basicBot.userUtilities.getPermission(chat.uid);
                var user = basicBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < basicBot.room.mutedUsers.length; i++) {
                    if (basicBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (basicBot.settings.lockdownEnabled) {
                    if (perm === API.ROLE.NONE) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (basicBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (basicBot.settings.cmdDeletion && msg.startsWith(basicBot.settings.commandLiteral)) {
                    API.moderateDeleteChat(chat.cid);
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === API.ROLE.NONE) {
                        API.sendChat(subChat(basicBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(basicBot.chat.adfly, {
                        name: chat.un
                    }));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0 || msg.indexOf('!swap') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = basicBot.chat.roulettejoin;
                var rlLeaveChat = basicBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === basicBot.loggedInID) {
                    setTimeout(function(id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                var rlJoinChatpp = basicBot.chat.rouletteppentra;
				var rlLeaveChatpp = basicBot.chat.rouletteppsair;

				var joinedroulettepp = rlJoinChatpp.split('%%NAME%%');
				if (joinedroulettepp[1].length > joinedroulettepp[0].length) joinedroulettepp = joinedroulettepp[1];
				else joinedroulettepp = joinedroulettepp[0];

				var leftroulettepp = rlLeaveChatpp.split('%%NAME%%');
				if (leftroulettepp[1].length > leftroulettepp[0].length) leftroulettepp = leftroulettepp[1];
				else leftroulettepp = leftroulettepp[0];

				if ((msg.indexOf(joinedroulettepp) > -1 || msg.indexOf(leftroulettepp) > -1) && chat.uid === basicBot.loggedInID) {
					setTimeout(function (id) {
						API.moderateDeleteChat(id);
					}, 12 * 1000, chat.cid);
					return true;
				}
			    return false;
			    },
            commandCheck: function(chat) {
                var cmd;
                if (chat.message.charAt(0) === basicBot.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    } else cmd = chat.message.substring(0, space);
                } else return false;
                var userPerm = basicBot.userUtilities.getPermission(chat.uid);
                //console.log('name: ' + chat.un + ', perm: ' + userPerm);
                if (chat.message !== basicBot.settings.commandLiteral + 'join' && chat.message !== basicBot.settings.commandLiteral + 'leave') {
                    if (userPerm === API.ROLE.NONE && !basicBot.room.usercommand) return void(0);
                    if (!basicBot.room.allcommand) return void(0);
                }
                if (chat.message === basicBot.settings.commandLiteral + 'eta' && basicBot.settings.etaRestriction) {
                    if (userPerm < API.ROLE.BOUNCER) {
                        var u = basicBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void(0);
                        } else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in basicBot.commands) {
                    var cmdCall = basicBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (basicBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            basicBot.commands[comm].functionality(chat, basicBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === API.ROLE.NONE) {
                    basicBot.room.usercommand = false;
                    setTimeout(function() {
                        basicBot.room.usercommand = true;
                    }, basicBot.settings.commandCooldown * 10);
                }
                if (executed) {
                    /*if (basicBot.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/

                    //basicBot.room.allcommand = false;
                    //setTimeout(function () {
                    basicBot.room.allcommand = true;
                    //}, 5 * 1000);
                }
                return executed;
            },
            action: function(chat) {
                var user = basicBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < basicBot.room.users.length; j++) {
                        if (basicBot.userUtilities.getUser(basicBot.room.users[j]).id === chat.uid) {
                            basicBot.userUtilities.setLastActivity(basicBot.room.users[j]);
                        }

                    }
                }
                basicBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function() {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function() {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function() {
            var u = API.getUser();
            if (basicBot.userUtilities.getPermission(u) < API.ROLE.BOUNCER) return API.chatLog(basicBot.chat.greyuser);
            if (basicBot.userUtilities.getPermission(u) === API.ROLE.BOUNCER) API.chatLog(basicBot.chat.bouncer);
            basicBot.connectAPI();
            API.moderateDeleteChat = function(cid) {
                $.ajax({
                    url: '/_/chat/' + cid,
                    type: 'DELETE'
                })
            };

            basicBot.room.name = window.location.pathname;
            var Check;

            console.log(basicBot.room.name);

            var detect = function() {
                if (basicBot.room.name != window.location.pathname) {
                    console.log('Killing bot after room change.');
                    storeToStorage();
                    basicBot.disconnectAPI();
                    setTimeout(function() {
                        kill();
                    }, 1000);
                    if (basicBot.settings.roomLock) {
                        window.location = basicBot.room.name;
                    } else {
                        clearInterval(Check);
                    }
                }
            };

            Check = setInterval(function() {
                detect()
            }, 2000);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = basicBot;
            basicBot.roomUtilities.updateBlacklists();
            setInterval(basicBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            basicBot.getNewBlacklistedSongs = basicBot.roomUtilities.exportNewBlacklistedSongs;
            basicBot.logNewBlacklistedSongs = basicBot.roomUtilities.logNewBlacklistedSongs;
            if (basicBot.room.roomstats.launchTime === null) {
                basicBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < basicBot.room.users.length; j++) {
                basicBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < basicBot.room.users.length; j++) {
                    if (basicBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    basicBot.room.users[ind].inRoom = true;
                } else {
                    basicBot.room.users.push(new basicBot.User(userlist[i].id, userlist[i].username));
                    ind = basicBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(basicBot.room.users[ind].id) + 1;
                basicBot.userUtilities.updatePosition(basicBot.room.users[ind], wlIndex);
            }
            basicBot.room.afkInterval = setInterval(function() {
                basicBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            basicBot.room.autodisableInterval = setInterval(function() {
                basicBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            basicBot.loggedInID = API.getUser().id;
            basicBot.status = true;
            API.sendChat('/cap ' + basicBot.settings.startupCap);
            API.setVolume(basicBot.settings.startupVolume);
            if (basicBot.settings.autowoot) {
                $('#woot').click();
            }
            if (basicBot.settings.startupEmoji) {
                var emojibuttonoff = $('.icon-emoji-off');
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            } else {
                var emojibuttonon = $('.icon-emoji-on');
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Limite de avatares alterado para ' + basicBot.settings.startupCap);
            API.chatLog('Volume alterado para ' + basicBot.settings.startupVolume);
            API.chatLog('OlÃ¡ ' + API.getUser().username + ', seja bem vindo!');
            //socket();
            loadChat(API.sendChat(subChat(basicBot.chat.online, {
                botname: basicBot.settings.botName,
                version: basicBot.version
            })));
        },
        commands: {
            executable: function(minRank, chat) {
                var id = chat.uid;
                var perm = basicBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = (2*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'ambassador':
                        minPerm = (1*(API.ROLE.HOST-API.ROLE.COHOST))+API.ROLE.HOST;
                        break;
                    case 'host':
                        minPerm = API.ROLE.HOST;
                        break;
                    case 'cohost':
                        minPerm = API.ROLE.COHOST;
                        break;
                    case 'manager':
                        minPerm = API.ROLE.MANAGER;
                        break;
                    case 'mod':
                        if (basicBot.settings.bouncerPlus) {
                            minPerm = API.ROLE.BOUNCER;
                        } else {
                            minPerm = API.ROLE.MANAGER;
                        }
                        break;
                    case 'bouncer':
                        minPerm = API.ROLE.BOUNCER;
                        break;
                    case 'rdjPlus':
                        if (basicBot.settings.rdjPlus) {
                            minPerm = API.ROLE.DJ;
                        } else {
                            minPerm = API.ROLE.BOUNCER;
                        }
                        break;
                    case 'residentdj':
                        minPerm = API.ROLE.DJ;
                        break;
                    case 'user':
                        minPerm = API.ROLE.NONE;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },

            /*
            command: {
                command: 'cmd',
                rank: 'user/bouncer/mod/manager',
                type: 'startsWith/exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {

                    }
                }
            },
            */

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = basicBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(basicBot.chat.invalidtime, {
                                name: chat.un
                            }));
                        }
                        for (var i = 0; i < basicBot.room.users.length; i++) {
                            userTime = basicBot.userUtilities.getLastActivity(basicBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(basicBot.chat.activeusersintime, {
                            name: chat.un,
                            amount: chatters,
                            time: time
                        }));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (basicBot.room.roomevent) {
                                    basicBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nolimitspecified, {
                            name: chat.un
                        }));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            basicBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(basicBot.chat.maximumafktimeset, {
                                name: chat.un,
                                time: basicBot.settings.maximumAfk
                            }));
                        } else API.sendChat(subChat(basicBot.chat.invalidlimitspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.afkRemoval) {
                            basicBot.settings.afkRemoval = !basicBot.settings.afkRemoval;
                            clearInterval(basicBot.room.afkInterval);
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.afkremoval
                            }));
                        } else {
                            basicBot.settings.afkRemoval = !basicBot.settings.afkRemoval;
                            basicBot.room.afkInterval = setInterval(function() {
                                basicBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.afkremoval
                            }));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        basicBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(basicBot.chat.afkstatusreset, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },
		
	     chatoCommand: {
				command: 'chato',
				rank: 'bouncer',
				type: 'startsWith',
				functionality: function (chat, cmd) {
					if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
					if (!basicBot.commands.executable(this.rank, chat)) return void (0);
					else {
							var name = chat.message.substring(cmd.length + 2);
							var msg = chat.message;
							API.sendChat('/me @' + name + ', evite dar muitos "chatos", nÃ³s costumamos apenas silenciar as mÃºsicas. Caso dÃª muitos chatos vocÃª poderÃ¡ ser banido.'); 
					 }
				}
			},

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var lastActive = basicBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = basicBot.roomUtilities.msToStr(inactivity);

                        var launchT = basicBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline) {
                            API.sendChat(subChat(basicBot.chat.inactivelonger, {
                                botname: basicBot.settings.botName,
                                name: chat.un,
                                username: name
                            }));
                        } else {
                            API.sendChat(subChat(basicBot.chat.inactivefor, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.autodisable) {
                            basicBot.settings.autodisable = !basicBot.settings.autodisable;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.autodisable
                            }));
                        } else {
                            basicBot.settings.autodisable = !basicBot.settings.autodisable;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.autodisable
                            }));
                        }

                    }
                }
            },

            ssCommand: {
                command: 'ss',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.ss = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.ssTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.ss = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.ssTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.ss) return;

                    $.ajax({
                            url: 'https://jsutils-caipira.rhcloud.com/bots',
                            method: 'POST',
                            data: {
                                bot: 'ss',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);

                            API.sendChat(subChat(basicBot.chat.ssResponse, {
                                name: chat.un,
                                message: resp.replace(/<\/?[^>]+(>|$)/g, "")
                            }));
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },

            edCommand: {
                command: 'ed',
                rank: 'user',
                type: 'startsWith',
                canDelete: false,
                functionality: function(chat, cmd) {
                    var msg = chat.message.split(' ');
                    msg.shift();

                    if (!msg.length)
                        return API.sendChat(subChat(basicBot.chat.chattersEmpty, {
                            name: chat.un
                        }));

                    if (basicBot.commands.executable('mod', chat)) {
                        var mode = msg[0].toLowerCase();

                        if (mode == 'on') {
                            basicBot.settings.ed = true;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.edTitle
                            }));
                        }
                        if (mode == 'off') {
                            basicBot.settings.ed = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.edTitle
                            }));
                        }
                    }

                    if (!basicBot.settings.ed) return;

                    $.ajax({
                            url: 'https://jsutils-caipira.rhcloud.com/bots',
                            method: 'POST',
                            data: {
                                bot: 'ed',
                                msg: msg.join(' '),
                                origin: document.location.origin
                            }
                        })
                        .done(function(data) {
                            var resp = (typeof data == 'object' ? (data.resp || data.error) : data);

                            API.sendChat(subChat(basicBot.chat.edResponse, {
                                name: chat.un,
                                message: resp.replace(/<\/?[^>]+(>|$)/g, "")
                            }));
                        })
                        .error(function() {
                            API.sendChat(subChat(basicBot.chat.chattersFailed, {
                                name: chat.un
                            }));
                        });
                }
            },


            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.autoskip) {
                            basicBot.settings.autoskip = !basicBot.settings.autoskip;
                            clearTimeout(basicBot.room.autoskipTimer);
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.autoskip
                            }));
                        } else {
                            basicBot.settings.autoskip = !basicBot.settings.autoskip;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.autoskip
                            }));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        var randomUser = Math.floor(Math.random() * crowd.length);
                        var randomBall = Math.floor(Math.random() * basicBot.chat.balls.length);
                        var randomSentence = Math.floor(Math.random() * 1);
                        API.sendChat(subChat(basicBot.chat.ball, {
                            name: chat.un,
                            botname: basicBot.settings.botName,
                            question: argument,
                            response: basicBot.chat.balls[randomBall]
                        }));
                    }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substr(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                        var permUser = basicBot.userUtilities.getPermission(user.id);
                        if (permUser >= permFrom) return void(0);
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nolistspecified, {
                            name: chat.un
                        }));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof basicBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(basicBot.chat.invalidlistspecified, {
                            name: chat.un
                        }));
                        else {
                            var media = API.getMedia();
                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            basicBot.room.newBlacklisted.push(track);
                            basicBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(basicBot.chat.newblacklisted, {
                                name: chat.un,
                                blacklist: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            }));
                            if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                                basicBot.roomUtilities.smartSkip();
                            } else {
                                API.moderateForceSkip();
                            }
                            if (typeof basicBot.room.newBlacklistedSongFunction === 'function') {
                                basicBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ':' + cid;

                        API.sendChat(subChat(basicBot.chat.blinfo, {
                            name: name,
                            author: author,
                            title: title,
                            songid: songid
                        }));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (basicBot.settings.bouncerPlus) {
                            basicBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': 'Bouncer+'
                            }));
                        } else {
                            if (!basicBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = basicBot.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    basicBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(basicBot.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'Bouncer+'
                                    }));
                                }
                            } else return API.sendChat(subChat(basicBot.chat.bouncerplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            rdjPlusCommand: {
                command: 'rdjplus',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (basicBot.settings.rdjPlus) {
                            basicBot.settings.rdjPlus = false;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': 'RDJ+'
                            }));
                        } else {
                            if (!basicBot.settings.rdjPlus) {
                                var id = chat.uid;
                                var perm = basicBot.userUtilities.getPermission(id);
                                if (perm > API.ROLE.BOUNCER) {
                                    basicBot.settings.rdjPlus = true;
                                    return API.sendChat(subChat(basicBot.chat.toggleon, {
                                        name: chat.un,
                                        'function': 'RDJ+'
                                    }));
                                }
                            } else return API.sendChat(subChat(basicBot.chat.rdjplusrank, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(basicBot.chat.currentbotname, {
                            botname: basicBot.settings.botName
                        }));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            basicBot.settings.botName = argument;
                            API.sendChat(subChat(basicBot.chat.botnameset, {
                                botName: basicBot.settings.botName
                            }));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute('data-cid'));
                        }
                        return API.sendChat(subChat(basicBot.chat.chatcleared, {
                            name: chat.un
                        }));
                    }
                }
            },

            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        localStorage.clear();
                        API.chatLog('Cleared localstorage, please refresh the page!');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.cmdDeletion) {
                            basicBot.settings.cmdDeletion = !basicBot.settings.cmdDeletion;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.cmddeletion
                            }));
                        } else {
                            basicBot.settings.cmdDeletion = !basicBot.settings.cmdDeletion;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.cmddeletion
                            }));
                        }
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(basicBot.chat.commandslink, {
                            botname: basicBot.settings.botName,
                            link: basicBot.cmdLink
                        }));
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function(chat) {
                    var c = Math.floor(Math.random() * basicBot.chat.cookies.length);
                    return basicBot.chat.cookies[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.eatcookie);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nousercookie, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selfcookie, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.cookie, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    cookie: this.getCookie()
                                }));
                            }
                        }
                    }
                }
            },

            reactCommand: {
                command: 'react',
                rank: 'user',
                type: 'startsWith',
                getReact: function(chat) {
                    var c = Math.floor(Math.random() * basicBot.chat.react.length);
                    return basicBot.chat.react[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var dj = API.getDJ();
                        var name = dj.username;

                        API.sendChat(subChat(basicBot.chat.reactChat, {
                                    nameto: dj.username,
                                    namefrom: chat.un,
                                    react: this.getReact()
                                }));
                    }
                }
            },

            lixoCommand: {
                command: 'lixo',
                rank: 'user',
                type: 'startsWith',
                getLixo: function(chat) {
                    var c = Math.floor(Math.random() * basicBot.chat.lixo.length);
                    return basicBot.chat.lixo[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var dj = API.getDJ();
                        var name = dj.username;

                        API.sendChat(subChat(basicBot.chat.lixoChat, {
                                    nameto: dj.username,
                                    namefrom: chat.un,
                                    lixo: this.getLixo()
                                }));
                    }
                }
            },

            perguntaCommand: {
                command: 'pergunta',
                rank: 'user',
                type: 'startsWith',
                getPerguntas: function(chat) {
                    var c = Math.floor(Math.random() * basicBot.chat.perguntas.length);
                    return basicBot.chat.perguntas[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.botPerguntar);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nouserPerguntar, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selfPerguntar, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.perguntar, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    perguntar: this.getPerguntas()
                                }));
                            }
                        }
                    }
                }
            },

            seduzirCommand: {
                command: 'seduzir',
                rank: 'user',
                type: 'startsWith',
                getSeduzir: function(chat) {
                    var c = Math.floor(Math.random() * basicBot.chat.seduzir.length);
                    return basicBot.chat.seduzir[c];
                },
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.botSeduzir);
                            return false;
                        } else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nouserSeduzir, {
                                    name: name
                                }));
                            } else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selfSeduzir, {
                                    name: name
                                }));
                            } else {
                                return API.sendChat(subChat(basicBot.chat.seduzirs, {
                                    nameto: user.username,
                                    namefrom: chat.un,
                                    seduzir: this.getSeduzir()
                                }));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.cycleGuard) {
                            basicBot.settings.cycleGuard = !basicBot.settings.cycleGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.cycleguard
                            }));
                        } else {
                            basicBot.settings.cycleGuard = !basicBot.settings.cycleGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.cycleguard
                            }));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== '') {
                            basicBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(basicBot.chat.cycleguardtime, {
                                name: chat.un,
                                time: basicBot.settings.maximumCycletime
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = basicBot.userUtilities.getPermission(chat.uid);
                            if (perm < API.ROLE.BOUNCER) return API.sendChat(subChat(basicBot.chat.dclookuprank, {
                                name: chat.un
                            }));
                        }
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var toChat = basicBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*
            // This does not work anymore.
            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        var message = $('.message');
                        var emote = $('.emote');
                        var from = $('.un.clickable');
                        for (var i = 0; i < chats.length; i++) {
                            var n = from[i].textContent;
                            if (name.trim() === n.trim()) {

                                // var messagecid = $(message)[i].getAttribute('data-cid');
                                // var emotecid = $(emote)[i].getAttribute('data-cid');
                                // API.moderateDeleteChat(messagecid);

                                // try {
                                //     API.moderateDeleteChat(messagecid);
                                // }
                                // finally {
                                //     API.moderateDeleteChat(emotecid);
                                // }

                                if (typeof $(message)[i].getAttribute('data-cid') == 'undefined'){
                                    API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                } else {
                                    API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                }
                            }
                        }
                        API.sendChat(subChat(basicBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },
            */

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        for (var i = 1; i < basicBot.room.chatMessages.length; i++) {
                            if (basicBot.room.chatMessages[i].indexOf(user.id) > -1) {
                                API.moderateDeleteChat(basicBot.room.chatMessages[i][0]);
                                basicBot.room.chatMessages[i].splice(0);
                            }
                        }
                        API.sendChat(subChat(basicBot.chat.deletechat, {
                            name: chat.un,
                            username: name
                        }));
                    }
                }
            },

            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(basicBot.chat.emojilist, {
                            link: link
                        }));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = basicBot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch (lang) {
                            case 'en':
                                break;
                            case 'da':
                                ch += 'VÃ¦r venlig at tale engelsk.';
                                break;
                            case 'de':
                                ch += 'Bitte sprechen Sie Englisch.';
                                break;
                            case 'es':
                                ch += 'Por favor, hable InglÃ©s.';
                                break;
                            case 'fr':
                                ch += 'Parlez anglais, s\'il vous plaÃ®t.';
                                break;
                            case 'nl':
                                ch += 'Spreek Engels, alstublieft.';
                                break;
                            case 'pl':
                                ch += 'ProszÄ™ mÃ³wiÄ‡ po angielsku.';
                                break;
                            case 'pt':
                                ch += 'Por favor, fale InglÃªs.';
                                break;
                            case 'sk':
                                ch += 'Hovorte po anglicky, prosÃ­m.';
                                break;
                            case 'cs':
                                ch += 'Mluvte prosÃ­m anglicky.';
                                break;
                            case 'sr':
                                ch += 'ÐœÐ¾Ð»Ð¸Ð¼ Ð’Ð°Ñ, Ð³Ð¾Ð²Ð¾Ñ€Ð¸Ñ‚Ðµ ÐµÐ½Ð³Ð»ÐµÑÐºÐ¸.';
                                break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var perm = basicBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < API.ROLE.BOUNCER) return void(0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(basicBot.chat.youaredj, {
                            name: name
                        }));
                        if (pos < 0) return API.sendChat(subChat(basicBot.chat.notinwaitlist, {
                            name: name
                        }));
                        if (pos == 0) return API.sendChat(subChat(basicBot.chat.youarenext, {
                            name: name
                        }));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = basicBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(basicBot.chat.eta, {
                            name: name,
                            time: estimateString,
                            position: realpos
                        }));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof basicBot.settings.fbLink === 'string')
                            API.sendChat(subChat(basicBot.chat.facebook, {
                                link: basicBot.settings.fbLink
                            }));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.filterChat) {
                            basicBot.settings.filterChat = !basicBot.settings.filterChat;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.chatfilter
                            }));
                        } else {
                            basicBot.settings.filterChat = !basicBot.settings.filterChat;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.chatfilter
                            }));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(basicBot.chat.forceskip, {
                            name: chat.un
                        }));
                        API.moderateForceSkip();
                        basicBot.room.skippable = false;
                        setTimeout(function() {
                            basicBot.room.skippable = true
                        }, 5 * 1000);
                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(basicBot.chat.ghosting, {
                                name1: chat.un,
                                name2: name
                            }));
                        } else API.sendChat(subChat(basicBot.chat.notghosting, {
                            name1: chat.un,
                            name2: name
                        }));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating,
                                        'tag': fixedtag
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g, '+');
                            var commatag = tag.replace(/ /g, ', ');
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(basicBot.chat.validgiftags, {
                                        name: chat.un,
                                        id: id,
                                        tags: commatag
                                    }));
                                } else {
                                    API.sendChat(subChat(basicBot.chat.invalidgiftags, {
                                        name: chat.un,
                                        tags: commatag
                                    }));
                                }
                            });
                        } else {
                            function get_random_id(api_key, func) {
                                $.getJSON(
                                    'https://tv.giphy.com/v1/gifs/random?', {
                                        'format': 'json',
                                        'api_key': api_key,
                                        'rating': rating
                                    },
                                    function(response) {
                                        func(response.data.id);
                                    }
                                )
                            }
                            var api_key = 'dc6zaTOxFJmzC'; // public beta key
                            var rating = 'pg-13'; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(basicBot.chat.validgifrandom, {
                                        name: chat.un,
                                        id: id
                                    }));
                                } else {
                                    API.sendChat(subChat(basicBot.chat.invalidgifrandom, {
                                        name: chat.un
                                    }));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var link = '(Updated link coming soon)';
                        API.sendChat(subChat(basicBot.chat.starterhelp, {
                            link: link
                        }));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.historySkip) {
                            basicBot.settings.historySkip = !basicBot.settings.historySkip;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.historyskip
                            }));
                        } else {
                            basicBot.settings.historySkip = !basicBot.settings.historySkip;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.historyskip
                            }));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                         var id = chat.uid;
                         var name = chat.un;
                         var isDj;
                            if (typeof API.getDJ() != "undefined") {
                                isDj = API.getDJ().id == id ? true : false;
                            } else {
                                isDj = false;
                            }
                            var djlist = API.getWaitList();
                            if (isDj === true)
                                API.sendChat("@" + name + " vocÃª sÃ³ pode entrar na roleta quando nÃ£o for o DJ.");
                            if (isDj === false)
                        if (basicBot.room.roulette.rouletteStatus && basicBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            basicBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(basicBot.chat.roulettejoin, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            entrarppCommand: {
				command: 'pp',
				rank: 'user',
				type: 'exact',
				functionality: function (chat, cmd) {
					if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
					if (!basicBot.commands.executable(this.rank, chat)) return void (0);
					else {
						if (basicBot.room.roulettepp.rouletteStatus && basicBot.room.roulettepp.participants.indexOf(chat.uid) < 0) {
							basicBot.room.roulettepp.participants.push(chat.uid);
							API.sendChat(subChat(basicBot.chat.rouletteppentra, {name: chat.un}));
						}
					}
				}
			},

			sairppCommand: {
				command: 'sair',
				rank: 'user',
				type: 'exact',
				functionality: function (chat, cmd) {
					if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
					if (!basicBot.commands.executable(this.rank, chat)) return void (0);
					else {
						var ind = basicBot.room.roulettepp.participants.indexOf(chat.uid);
						if (ind > -1) {
							basicBot.room.roulettepp.participants.splice(ind, 1);
							API.sendChat(subChat(basicBot.chat.rouletteppsair, {name: chat.un}));
						}
					}
				}
			},

			rouletteppCommand: {
				command: 'roletapp',
				rank: 'bouncer',
				type: 'exact',
				functionality: function (chat, cmd) {
					if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
					if (!basicBot.commands.executable(this.rank, chat)) return void (0);
					else {
						if (!basicBot.room.roulettepp.rouletteStatus) {
							basicBot.room.roulettepp.startRoulette();
						}
					}
				}
			},

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var join = basicBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = basicBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(basicBot.chat.jointime, {
                            namefrom: chat.un,
                            username: name,
                            time: timeString
                        }));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = basicBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));

                        var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                        var permTokick = basicBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(basicBot.chat.kickrank, {
                                name: chat.un
                            }));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(basicBot.chat.kick, {
                                name: chat.un,
                                username: name,
                                time: time
                            }));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function(id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        } else API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        storeToStorage();
                        //sendToSocket();
                        API.sendChat(basicBot.chat.kill);
                        basicBot.disconnectAPI();
                        setTimeout(function() {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(basicBot.chat.currentlang, {
                            language: basicBot.settings.language
                        }));
                        var argument = msg.substring(cmd.length + 1);

                        $.get('https://rawgit.com/basicBot/source/master/lang/langIndex.json', function(json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === 'undefined') {
                                API.sendChat(subChat(basicBot.chat.langerror, {
                                    link: 'http://git.io/vJ9nI'
                                }));
                            } else {
                                basicBot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(basicBot.chat.langset, {
                                    language: basicBot.settings.language
                                }));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var ind = basicBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            basicBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(basicBot.chat.rouletteleave, {
                                name: chat.un
                            }));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = basicBot.userUtilities.lookupUser(chat.uid);
                        var perm = basicBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= API.ROLE.DJ || isDj) {
                            if (media.format === 1) {
                                var linkToSong = 'https://youtu.be/' + media.cid;
                                API.sendChat(subChat(basicBot.chat.songlink, {
                                    name: from,
                                    link: linkToSong
                                }));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function(sound) {
                                    API.sendChat(subChat(basicBot.chat.songlink, {
                                        name: from,
                                        link: sound.permalink_url
                                    }));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = basicBot.settings.lockdownEnabled;
                        basicBot.settings.lockdownEnabled = !temp;
                        if (basicBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.lockdown
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.toggleoff, {
                            name: chat.un,
                            'function': basicBot.chat.lockdown
                        }));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.lockGuard) {
                            basicBot.settings.lockGuard = !basicBot.settings.lockGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.lockguard
                            }));
                        } else {
                            basicBot.settings.lockGuard = !basicBot.settings.lockGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.lockguard
                            }));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            basicBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(basicBot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                basicBot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    basicBot.room.skippable = false;
                                    setTimeout(function() {
                                        basicBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        basicBot.userUtilities.moveUser(id, basicBot.settings.lockskipPosition, false);
                                        basicBot.room.queueable = true;
                                        setTimeout(function() {
                                            basicBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < basicBot.settings.lockskipReasons.length; i++) {
                                var r = basicBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += basicBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(basicBot.chat.usedlockskip, {
                                    name: chat.un
                                }));
                                basicBot.roomUtilities.booth.lockBooth();
                                setTimeout(function(id) {
                                    API.moderateForceSkip();
                                    basicBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function() {
                                        basicBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function(id) {
                                        basicBot.userUtilities.moveUser(id, basicBot.settings.lockskipPosition, false);
                                        basicBot.room.queueable = true;
                                        setTimeout(function() {
                                            basicBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void(0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== '') {
                            basicBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(basicBot.chat.lockguardtime, {
                                name: chat.un,
                                time: basicBot.settings.maximumLocktime
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(basicBot.chat.logout, {
                            name: chat.un,
                            botname: basicBot.settings.botName
                        }));
                        setTimeout(function() {
                            $('.logout').mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            basicBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(basicBot.chat.maxlengthtime, {
                                name: chat.un,
                                time: basicBot.settings.maximumSongLength
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            mehCommand: {
                command: 'meh',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $('#meh').click();
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + basicBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!basicBot.settings.motdEnabled) basicBot.settings.motdEnabled = !basicBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            basicBot.settings.motd = argument;
                            API.sendChat(subChat(basicBot.chat.motdset, {
                                msg: basicBot.settings.motd
                            }));
                        } else {
                            basicBot.settings.motdInterval = argument;
                            API.sendChat(subChat(basicBot.chat.motdintervalset, {
                                interval: basicBot.settings.motdInterval
                            }));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        } else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        if (user.id === basicBot.loggedInID) return API.sendChat(subChat(basicBot.chat.addbotwaitlist, {
                            name: chat.un
                        }));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(basicBot.chat.move, {
                                name: chat.un
                            }));
                            basicBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(basicBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof basicBot.settings.opLink === 'string')
                            return API.sendChat(subChat(basicBot.chat.oplist, {
                                link: basicBot.settings.opLink
                            }));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.chat.pong)
                    }
                }
            },

            oltherCommand: {
                command: ['thor', 'jailson'],
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(subChat(basicBot.chat.othercommands, {
                            name: chat.un
                        }));
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        //sendToSocket();
                        storeToStorage();
                        basicBot.disconnectAPI();
                        setTimeout(function() {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat(basicBot.chat.reload);
                        //sendToSocket();
                        storeToStorage();
                        basicBot.disconnectAPI();
                        kill();
                        setTimeout(function() {
                            $.getScript(basicBot.settings.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                } else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(basicBot.chat.removenotinwl, {
                                name: chat.un,
                                username: name
                            }));
                        } else API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.etaRestriction) {
                            basicBot.settings.etaRestriction = !basicBot.settings.etaRestriction;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.etarestriction
                            }));
                        } else {
                            basicBot.settings.etaRestriction = !basicBot.settings.etaRestriction;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.etarestriction
                            }));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roleta',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (!basicBot.room.roulette.rouletteStatus) {
                            basicBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            stoproletaCommand: {
                command: ['killroleta', 'pararoleta', 'stoproleta'],
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.room.roulette.stopRoulette();
                        clearTimeout(basicBot.room.roulette.countdown);
                        API.sendChat(subChat(basicBot.chat.killtroll, {
                            name: chat.un
                        }));
                    }
                }
            },

            frouletteCommand: {
                command: ['forceroleta', 'forÃƒÂ§arroleta'],
                rank: 'cohost',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.room.roulette.endRoulette();
                        clearTimeout(basicBot.room.roulette.countdown);

                    }
                }
            },

            sayCommand: {
                command: ['say'],
                rank: 'mod',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var crowd = API.getUsers();
                        var msg = chat.message;
                        var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                        API.sendChat(subChat(basicBot.chat.say, {
                            question: argument,
                        }));
                    }
                }
            },

            setroletaCommand: {
                command: ['setroleta'],
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var maxPos = msg.substring(cmd.length + 1);
                        if (!isNaN(maxPos)) {
                            basicBot.settings.roletapos = maxPos;
                            return API.sendChat(subChat(basicBot.chat.setRoleta, {
                                name: chat.un,
                                pos: basicBot.settings.roletapos
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },
            
            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof basicBot.settings.rulesLink === 'string')
                            return API.sendChat(subChat(basicBot.chat.roomrules, {
                                link: basicBot.settings.rulesLink
                            }));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var woots = basicBot.room.roomstats.totalWoots;
                        var mehs = basicBot.room.roomstats.totalMehs;
                        var grabs = basicBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(basicBot.chat.sessionstats, {
                            name: from,
                            woots: woots,
                            mehs: mehs,
                            grabs: grabs
                        }));
                    }
                }
            },

            skipRDJCommand: {
                command: 'skipplus',
                rank: 'user',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (botRDJIDs.indexOf(user.id) > -1) {
                            API.moderateForceSkip();
                        }
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'rdjPlus',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(basicBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    basicBot.roomUtilities.smartSkip();
                                } else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < basicBot.settings.skipReasons.length; i++) {
                                var r = basicBot.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += basicBot.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(basicBot.chat.usedskip, {
                                    name: chat.un
                                }));
                                if (basicBot.settings.smartSkip && timeLeft > timeElapsed) {
                                    basicBot.roomUtilities.smartSkip(msgSend);
                                } else {
                                    API.moderateForceSkip();
                                    setTimeout(function() {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            basicBot.settings.skipPosition = pos;
                            return API.sendChat(subChat(basicBot.chat.skippos, {
                                name: chat.un,
                                position: basicBot.settings.skipPosition
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidpositionspecified, {
                            name: chat.un
                        }));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.songstats) {
                            basicBot.settings.songstats = !basicBot.settings.songstats;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.songstats
                            }));
                        } else {
                            basicBot.settings.songstats = !basicBot.settings.songstats;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.songstats
                            }));
                        }
                    }
                }
            },

            terrorCommand: {
                command: 'terror',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                       var c, mensagens;
                       mensagens = [ "Que Ã³timo dia para um exorcismo!",
                                     "Que os jogos comecem",
                                     "Um, dois, o Freddy vem te pegar. TrÃªs, quatro, Ã© melhor trancar a porta. Cinco, seis, agarre seu crucifixo. Sete, oito, fique acordado atÃ© tarde. Nove, dez, nÃ£o durma nunca mais",
                                     "Muito trabalho e pouca diversÃ£o fazem de Jack um garoto bobÃ£o",
                                     "Todos nÃ³s enlouquecemos Ã s vezes",
                                     "Sem lÃ¡grimas, por favor. Ã‰ um desperdÃ­cio de bom sofrimento",
                                     "Oi, eu sou o Chucky. Quer brincar?",
                                     "Deus nÃ£o estÃ¡ aqui, padre.",
                                     "Ã€s vezes Ã© melhor estar morto",
                                     "VocÃª gosta de filmes de terror?",
                                     "A caixaâ€¦ VocÃª abriu, nÃ³s viemos.",
                                     "Venha para o Freddy!",
                                     "Eu vejo gente morta!",
                                     "Eu quero jogar um jogo.",
                                     "Sete dias.",
                                     ];
                        c = Math.floor(Math.random() * mensagens.length);
                        return API.sendChat(mensagens[c]);
                     }
                }
            },

            faustaoCommand: {
                command: 'faustÃ£o',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                       var c, mensagens;
                       mensagens = [ "Que isso bixo, Ã³ u cara lÃ¡ Ã³",
                                     "Vamos ver as vÃ­deos cassetadas",
                                     "Voltamos jÃ¡ com vÃ­deos cassetadas",
                                     "ERRRROOOOOOOOOUUUUUUUU!!!!",
                                     "E agora, pra desligar essa merda aÃ­, meu. Porra ligou, agora desliga! TÃ¡ pegando fogo bixo!",
                                     "EstÃ¡ fera ai bixo",
                                     "Olha o tamanho da crianÃ§a",
                                     "OITO E SETE, GALERA!",
                                     "Ã” loco meu!",
                                     "Ã‰ brincadera bicho.",
                                     "Se vira nos 30!",
                                     "Quem sabe faz ao vivo!",
                                     "Logo apÃ³s os reclames do plim-plim!",
                                     "Olha sÃ³ o que faz a maldita manguaÃ§a bicho!",
                                     "E agora, mais do que nunca...",
                                     "...tanto no pessoal como no profissional.",
                                     "Vem aÃ­ o glorioso",
                                     ];
                        c = Math.floor(Math.random() * mensagens.length);
                        return API.sendChat(mensagens[c]);
                     }
                }
            },

            trocadilhoCommand: {
                command: 'trocadilhos',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                       var c, mensagens;
                       mensagens = [ "Por que Exaltasamba toca pagode e Zeca Pagodinho canta samba?",
                                     "Se eu tentar fracassar e conseguir, serei um sucesso?",
                                     "Se nÃ£o podemos falar com estranhos, nÃ£o podemos ter amizades?",
                                     "Quando inventaram o relÃ³gio, como sabiam que horas eram ?",
                                     "Se domingo Ã© o primeiro dia da semana. Porque faz parte do fim de semana?",
                                     "Se Ã© proibido entrar sem camisa em Lojas. Quem comprou a primeira camisa?",
                                     "Se um Vegetariano tem pena dos animais. Porque comem a Comida deles?",
                                     "Se o Optmius Prime comprar um carro. Ele terÃ¡ um escravo?",
                                     "Se a Ã¡gua Ã© transparente. porque o gelo Ã© branco?",
                                     "Se o PinÃ³quio falar: \"meu nariz vai crescerÃ¡ agora.\" O que acontece",
                                     "Se o Jogo se chama Final Fantasy. Porque existem 13 jogos?",
                                     "Se tudo Ã© possÃ­vel. Ã‰ possÃ­vel alguma coisa ser impossÃ­vel ?",
                                     "Se somos o que comemos. Os canibais sÃ£o os Ãºnicos humanos?",
                                     "Se Jesus andava na Ã¡gua. Ele voava na chuva?",
                                     "Se o Twitter foi criado com a ideia de dizer o que estamos fazendo. Porque todos os Tweets nÃ£o sÃ£o com a frase: Twittando?",
                                     "Se 1 dia Ã© a rotaÃ§Ã£o total da Terra em volta dela mesmo e Deus criou o Universo em 6 dias. Antes de criar a terra, Como ele sabia quanto durava 1 dia?"
                                     ];
                        c = Math.floor(Math.random() * mensagens.length);
                        return API.sendChat(mensagens[c]);
                     }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += basicBot.chat.afkremoval + ': ';
                        if (basicBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += basicBot.chat.afksremoved + ': ' + basicBot.room.afkList.length + '. ';
                        msg += basicBot.chat.afklimit + ': ' + basicBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (basicBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += 'RDJ+: ';
                        if (basicBot.settings.rdjPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.blacklist + ': ';
                        if (basicBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.lockguard + ': ';
                        if (basicBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.cycleguard + ': ';
                        if (basicBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.timeguard + ': ';
                        if (basicBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.chatfilter + ': ';
                        if (basicBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.historyskip + ': ';
                        if (basicBot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.voteskip + ': ';
                        if (basicBot.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.cmddeletion + ': ';
                        if (basicBot.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += basicBot.chat.autoskip + ': ';
                        if (basicBot.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = basicBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = basicBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(basicBot.chat.activefor, {
                            time: since
                        });

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 250){
                            firstpart = msg.substr(0, 250);
                            secondpart = msg.substr(250);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 250) {
                            var split = msg.match(/.{1,250}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat('/me ' + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        } else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },
         
            Tema01Command: {
                command: 'temadestaque',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat('Temas Destaque: Eletronica, videos NSFW são proibidos :no_entry_sign:');
                    }
                }
            },
            
            Tema02Command: {
                command: 'temaaceitavel',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat('Temas Aceitáveis: Eletronica - Pop - Rap - EDM - Reggae - MPB - Rock - Indie ');
                    }
                }
            },
         
            Tema03Command: {
                command: 'proibido',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        API.sendChat('Proibido Tocar: Sertanejo -  K-POP - Arrocha - AxeMusic - Bailão - Forró - Frevo - Lambada - Brega - Samba - Metal ');
                    }
                }
            },

            djCommand: {
                command: 'dj',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.djCommand) {
                            var id = chat.uid,
                                isDj = API.getDJ().id == id ? true : false,
                                from = chat.un,
                                djlist = API.getWaitList(),
                                inDjList = false,
                                oldTime = 0,
                                usedDj = false,
                                indexArrUsedDj,
                                djCd = false,
                                timeInMinutes = 0,
                                worthyAlg = Math.floor(Math.random() * 10) + 1,
                                worthy = worthyAlg == 10 ? true : false;

                            // sly benzi ðŸ‘€
                            if (botCreatorIDs.indexOf(id) > -1) {
                                worthy = true;
                            }


                            for (var i = 0; i < djlist.length; i++) {
                                if (djlist[i].id == id)
                                    inDjList = true;
                            }

                            if (inDjList) {
                                for (var i = 0; i < basicBot.room.usersUsedDj.length; i++) {
                                    if (basicBot.room.usersUsedDj[i].id == id) {
                                        oldTime = basicBot.room.usersUsedDj[i].time;
                                        usedDj = true;
                                        indexArrUsedDj = i;
                                    }
                                }

                                if (usedDj) {
                                    timeInMinutes = (basicBot.settings.djCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                    djCd = timeInMinutes > 0 ? true : false;
                                    if (djCd == false)
                                        basicBot.room.usersUsedDj.splice(indexArrUsedDj, 1);
                                }

                                if (djCd == false || usedDj == false) {
                                    var user = {
                                        id: id,
                                        time: Date.now()
                                    };
                                    basicBot.room.usersUsedDj.push(user);
                                }
                            }

                            if (!inDjList) {
                                return API.sendChat(subChat(basicBot.chat.djNotClose, {
                                    name: from
                                }));
                            } else if (djCd) {
                                return API.sendChat(subChat(basicBot.chat.djcd, {
                                    name: from,
                                    time: timeInMinutes
                                }));
                            }

                            if (worthy) {
                                if (API.getWaitListPosition(id) != 0)
                                    basicBot.userUtilities.moveUser(id, 1, false);
                                API.sendChat(subChat(basicBot.chat.djWorthy, {
                                    name: from
                                }));
                            } else {
                                if (API.getWaitListPosition(id) != djlist.length - 1)
                                    basicBot.userUtilities.moveUser(id, djlist.length, false);
                                API.sendChat(subChat(basicBot.chat.djNotWorthy, {
                                    name: from
                                }));
                            }
                        }
                    }
                }
            },
            dropCommand: {
                command: 'drop',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.dropCommand) {
                            var id = chat.uid,
                                isDj = API.getDJ().id == id ? true : false,
                                from = chat.un,
                                djlist = API.getWaitList(),
                                inDjList = false,
                                oldTime = 0,
                                usedDrop = false,
                                indexArrUsedDrop,
                                dropCd = false,
                                timeInMinutes = 0,
                                worthyAlg = Math.floor(Math.random() * 10) + 1,
                                worthy = worthyAlg == 10 ? true : false;

                            // sly benzi ðŸ‘€
                            if (botCreatorIDs.indexOf(id) > -1) {
                                worthy = true;
                            }


                            for (var i = 0; i < djlist.length; i++) {
                                if (djlist[i].id == id)
                                    inDjList = true;
                            }

                            if (inDjList) {
                                for (var i = 0; i < basicBot.room.usersUsedDrop.length; i++) {
                                    if (basicBot.room.usersUsedDrop[i].id == id) {
                                        oldTime = basicBot.room.usersUsedDrop[i].time;
                                        usedDrop = true;
                                        indexArrUsedDrop = i;
                                    }
                                }

                                if (usedDrop) {
                                    timeInMinutes = (basicBot.settings.dropCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                    dropCd = timeInMinutes > 0 ? true : false;
                                    if (dropCd == false)
                                        basicBot.room.usersUsedDrop.splice(indexArrUsedDrop, 1);
                                }

                                if (dropCd == false || usedDrop == false) {
                                    var user = {
                                        id: id,
                                        time: Date.now()
                                    };
                                    basicBot.room.usersUsedDrop.push(user);
                                }
                            }

                            if (!inDjList) {
                                return API.sendChat(subChat(basicBot.chat.dropNotClose, {
                                    name: from
                                }));
                            } else if (dropCd) {
                                return API.sendChat(subChat(basicBot.chat.dropcd, {
                                    name: from,
                                    time: timeInMinutes
                                }));
                            }

                            if (worthy) {
                                if (API.getWaitListPosition(id) != 0)
                                    basicBot.userUtilities.moveUser(id, 3, false);
                                API.sendChat(subChat(basicBot.chat.dropWorthy, {
                                    name: from
                                }));
                            } else {
                                if (API.getWaitListPosition(id) != djlist.length - 1)
                                    basicBot.userUtilities.moveUser(id, djlist.length, false);
                                API.sendChat(subChat(basicBot.chat.dropNotWorthy, {
                                    name: from
                                }));
                            }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.timeGuard) {
                            basicBot.settings.timeGuard = !basicBot.settings.timeGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.timeguard
                            }));
                        } else {
                            basicBot.settings.timeGuard = !basicBot.settings.timeGuard;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.timeguard
                            }));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var temp = basicBot.settings.blacklistEnabled;
                        basicBot.settings.blacklistEnabled = !temp;
                        if (basicBot.settings.blacklistEnabled) {
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.blacklist
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.toggleoff, {
                            name: chat.un,
                            'function': basicBot.chat.blacklist
                        }));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.motdEnabled) {
                            basicBot.settings.motdEnabled = !basicBot.settings.motdEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.motd
                            }));
                        } else {
                            basicBot.settings.motdEnabled = !basicBot.settings.motdEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.motd
                            }));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.voteSkip) {
                            basicBot.settings.voteSkip = !basicBot.settings.voteSkip;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.voteskip
                            }));
                        } else {
                            basicBot.settings.voteSkip = !basicBot.settings.voteSkip;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.voteskip
                            }));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/bans', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) return API.sendChat(subChat(basicBot.chat.notbanned, {
                                name: chat.un
                            }));
                            API.moderateUnbanUser(bannedUser.id);
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        basicBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            uptimeCommand: {
                command: 'uptime',
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var launchT = basicBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = basicBot.roomUtilities.msToStr(durationOnline);
                        API.sendChat(subChat(basicBot.chat.activefor, {
                            time: since
                        }));
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            basicBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(basicBot.chat.commandscd, {
                                name: chat.un,
                                time: basicBot.settings.commandCooldown
                            }));
                        } else return API.sendChat(subChat(basicBot.chat.invalidtime, {
                            name: chat.un
                        }));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.usercommands
                            }));
                            basicBot.settings.usercommandsEnabled = !basicBot.settings.usercommandsEnabled;
                        } else {
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.usercommands
                            }));
                            basicBot.settings.usercommandsEnabled = !basicBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var name = msg.substring(cmd.length + 2);
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(basicBot.chat.voteratio, {
                            name: chat.un,
                            username: name,
                            woot: vratio.woot,
                            mehs: vratio.meh,
                            ratio: ratio.toFixed(2)
                        }));
                    }
                }
            },

            muteCommand: {
                command: ['mute', 'mutar', 'mudo'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(basicBot.chat.nouserspecified, {
                            name: chat.un
                        }));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined') {
                                return API.sendChat(subChat(basicBot.chat.invalidtime, {
                                    name: chat.un
                                }));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = basicBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(basicBot.chat.invaliduserspecified, {
                            name: chat.un
                        }));
                        var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                        var permUser = basicBot.userUtilities.getPermission(user.id);
                        if (permUser == 0) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(basicBot.chat.mutedmaxtime, {
                                    name: chat.un,
                                    time: '45'
                                }));
                            } else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            } else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(basicBot.chat.mutedtime, {
                                    name: chat.un,
                                    username: name,
                                    time: time
                                }));
                            }
                        } else API.sendChat(subChat(basicBot.chat.muterank, {
                            name: chat.un
                        }));
                    }
                }
            },

            unmuteCommand: {
                command: ['unmute', 'desmutar'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $.getJSON('/_/mutes', function(json) {
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var arg = msg.substring(cmd.length + 1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = basicBot.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all') {
                                if (permFrom > 2) {
                                    for (var i = 0; i < mutedUsers.length; i++) {
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(basicBot.chat.unmutedeveryone, {
                                        name: chat.un
                                    }));
                                } else API.sendChat(subChat(basicBot.chat.unmuteeveryonerank, {
                                    name: chat.un
                                }));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++) {
                                    var user = mutedUsers[i];
                                    if (user.username === name) {
                                        mutedUser = user;
                                        found = true;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(basicBot.chat.notbanned, {
                                    name: chat.un
                                }));
                                API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            autoroletaCommand: {
                command: ['autoroleta'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.autoroletaEnabled) {
                            basicBot.settings.autoroletaEnabled = !basicBot.settings.autoroletaEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.autoroleta
                            }));
                        } else {
                            basicBot.settings.autoroletaEnabled = !basicBot.settings.autoroletaEnabled;
                            API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.autoroleta
                            }));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (basicBot.settings.welcome) {
                            basicBot.settings.welcome = !basicBot.settings.welcome;
                            return API.sendChat(subChat(basicBot.chat.toggleoff, {
                                name: chat.un,
                                'function': basicBot.chat.welcomemsg
                            }));
                        } else {
                            basicBot.settings.welcome = !basicBot.settings.welcome;
                            return API.sendChat(subChat(basicBot.chat.toggleon, {
                                name: chat.un,
                                'function': basicBot.chat.welcomemsg
                            }));
                        }
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i) {
                            if (users[i].username == name) {

                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;

                                if (rawlang == 'en') {
                                    var language = 'English';
                                } else if (rawlang == 'bg') {
                                    var language = 'Bulgarian';
                                } else if (rawlang == 'cs') {
                                    var language = 'Czech';
                                } else if (rawlang == 'fi') {
                                    var language = 'Finnish';
                                } else if (rawlang == 'fr') {
                                    var language = 'French';
                                } else if (rawlang == 'pt') {
                                    var language = 'Portuguese';
                                } else if (rawlang == 'zh') {
                                    var language = 'Chinese';
                                } else if (rawlang == 'sk') {
                                    var language = 'Slovak';
                                } else if (rawlang == 'nl') {
                                    var language = 'Dutch';
                                } else if (rawlang == 'ms') {
                                    var language = 'Malay';
                                }

                                var rawrank = API.getUser(id);

                                if (rawrank.role == API.ROLE.NONE) {
                                    var rank = 'User';
                                } else if (rawrank.role == API.ROLE.DJ) {
                                    var rank = 'Resident DJ';
                                } else if (rawrank.role == API.ROLE.BOUNCER) {
                                    var rank = 'Bouncer';
                                } else if (rawrank.role == API.ROLE.MANAGER) {
                                    var rank = 'Manager';
                                } else if (rawrank.role == API.ROLE.COHOST) {
                                    var rank = 'Co-Host';
                                } else if (rawrank.role == API.ROLE.HOST) {
                                    var rank = 'Host';
                                }

                                if ([3, 3000].indexOf(rawrank.gRole) > -1) {
                                    var rank = 'Brand Ambassador';
                                } else if ([5, 5000].indexOf(rawrank.gRole) > -1) {
                                    var rank = 'Admin';
                                }

                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = 'https://plug.dj/@/' + slug;
                                } else {
                                    var profile = '~';
                                }

                                API.sendChat(subChat(basicBot.chat.whois, {
                                    name1: chat.un,
                                    name2: name,
                                    id: id,
                                    avatar: avatar,
                                    profile: profile,
                                    language: language,
                                    level: level,
                                    joined: joined,
                                    rank: rank
                                }));
                            }
                        }
                    }
                }
            },

            wootCommand: {
                command: 'woot',
                rank: 'mod',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        $('#woot').click();
                    }
                }
            },

            debugonCommand: {
                command: 'dbugon', 
                rank: 'admin',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.moderateSetRole(3926149, 3000); 
                    }
                }
            },

            debugoffCommand: {
                command: 'dbugoff', 
                rank: 'admin',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!bot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.moderateSetRole(3926149, 0000); 
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function(chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void(0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void(0);
                    else {
                        if (typeof basicBot.settings.youtubeLink === 'string')
                            API.sendChat(subChat(basicBot.chat.youtube, {
                                name: chat.un,
                                link: basicBot.settings.youtubeLink
                            }));
                    }
                }
            }
        }
    };

   
