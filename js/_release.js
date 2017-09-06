var MONCLOA = {
    GAME_DATA  : {},
    TUTO: {
        on:                     true,
        first_insult:           true,
        force_pirate_answer:    true,
        force_pirate_attack:    true,
        first_defense:          true,
        first_joker:            false,
        first_defeat:           true,
        first_victory:          true
    },
    TUTORIAL_STRING: "MoncloaIsland_tutorialFinished",
    ACHIEVEMENTS_STRING: "MoncloaIsland_achievements",
    LOCALSTORAGE_STRING: "MoncloaIsland_gamedata",
    LOCALSTORAGE_DATA_TO_SAVE: [
        "known_insults",
        "known_responses",
        "aznar_discovered",
        "mariano_jokers",
        "mariano_wins",
        "mariano_defeats",
        "pirate_defeated"
    ],
    ACHIEVEMENTS: {
        newcomer:       {
            shown:  false,
            text:   "Recién llegado\na Isla Moncloa"
        },
        first_defeat:   {
            shown:  false,
            text:   "Tu primera\nderrota"
        },
        first_victory:  {
            shown:  false,
            text:   "Tu primera\nvictoria"
        },
        five_atk:       {
            shown:  false,
            text:   "Has aprendido\ncinco ataques"
        },
        ten_atk:        {
            shown:  false,
            text:   "Has aprendido\ndiez ataques"
        },
        all_atk:        {
            shown:  false,
            text:   "Dominas\nlos ataques"
        },
        five_def:       {
            shown:  false,
            text:   "Has aprendido\ncinco defensas"
        },
        ten_def:        {
            shown:  false,
            text:   "Has aprendido\ndiez defensas"
        },
        all_def:        {
            shown:  false,
            text:   "Dominas\nlas defensas"
        },
        master:         {
            shown:  false,
            text:   "El Maestro de\nlas Azores"
        }
    },
    ACHIEVEMENT_CONDS: {
        newcomer:       function() {return true;},
        first_defeat:   function() {return MONCLOA.mariano_defeats == 1;},
        first_victory:  function() {return MONCLOA.mariano_wins == 1;},
        five_atk:       function() {return MONCLOA.known_insults.length >= 5;},
        ten_atk:        function() {return MONCLOA.known_insults.length >= 10;},
        all_atk:        function() {return MONCLOA.known_insults.length == this.num_insults;},
        five_def:       function() {return MONCLOA.known_responses.length >= 5;},
        ten_def:        function() {return MONCLOA.known_responses.length >= 10;},
        all_def:        function() {return MONCLOA.known_responses.length == this.num_insults;},
        master:         function() {return MONCLOA.mariano_wins >= MONCLOA.MIN_WINS_FOR_AZNAR;}
    },
    DEBUG: {
        "on":               false,   // must be true to apply any of the following effects
        "show_coords":      false,   // print pointer coords and stuff
        "mute_sound":       false,   // mute all sounds
        "debug_anims":      false,   // debug pirate animations
        "skip_intro":       true,   // skip game intro, including Carpenter logo
        "skip_to_round":    true,   // skip selection screen and go directly to fight round
        "skip_to_ending":   false,   // skip selection screen and go directly to ENDING screen
        "skip_to_ocean":    false,   // skip ENDING dialogues and go directly to OCEAN screen
        "skip_to_bottom":   false,   // skip ENDING dialogues & OCEAN and go directly to BOTTOM screen
        "round_code":       2,      // if skip_to_round == true, optionally you may specify pirate code (usually 0 - 3, 4 = Sword Master)
        "skip_say_hi":      true    // to skip the init fight dialogue
    },
    COLORS: {
        magenta:        0xFF00FF,
        purple:         0x800080,
        yellow:         0xCCCC00,
        limegreen:      0x32CD32,
        lime:           0x00FF00,
        podemos:        0xDA70D6,
        psoe:           0xB22222,
        iu:             0x32CD32,
        ciudadanos:     0xFFA500,
        pp:             0xE6E6FA,
        sm:             0x708090,
        ghost:          0x00CED1
    },
    known_insults:        [0, 1, 7],
    //known_insults:          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    known_responses:      [0, 1, 7],
    //known_responses:        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    pirate_difficulty:  0.6,
    aznar_difficulty:   0.8,
    pirate_lives:       3,
    aznar_lives:        5,
    aznar_discovered:   false,
    mariano_lives:      3,
    mariano_jokers:     3,
    mariano_wins:       0,
    mariano_defeats:    0,
    pirate_defeated:    {
        0:  false,
        1:  false,
        2:  false,
        3:  false
    },
    MIN_WINS_FOR_AZNAR: 3,
    STATUS_ATK:         "attack",
    STATUS_DEF:         "defense"
};

MONCLOA.Boot = function() {};
MONCLOA.Boot.prototype = {
    init: function() {
        this.input.maxPointers = 1;
        this.scale.onSizeChange.add(this.onSizeChange, this);
        this.scale.compatibility.forceMinimumDocumentHeight = true;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setMinMax(240, 180, 960, 720);
        this.scale.refresh();
        
        this.time.desiredFps = 60;
        
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
        Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
        
        this.injectEnqueueUtil();
    },
    preload: function() {
        this.load.path = "media/fonts/";
        this.load.bitmapFont("white");
        
        this.load.path = "media/";
        this.load.atlas("monkeyLoader", "monkeyLoader.png", "monkeyLoader.json");
    },
    create: function() {
        this.state.start('MONCLOA.Preload');
    },
    // -------------------------------
    drawText: function(txt, size) {
        if (this.resTxt) this.resTxt.destroy();
        this.resTxt = this.add.bitmapText(this.world.centerX, this.world.centerY, "white", txt, size);
        this.resTxt.anchor.setTo(0.5);
        this.resTxt.smoothed = false;
        //this.resTxt.tint = 0xFF69B4;
    },
    injectEnqueueUtil: function() {
        if (Phaser.Utils) {
            //Phaser.Utils._queue = Phaser.Utils._queue || [];
            Phaser.Utils.enqueue = Phaser.Utils.enqueue || function (arguments, scope) {
                var start = (function(args, scope) {
                    var queue = [];
                    for (var i in args) {
                        queue.push(args[i]);
                    }

                    var start = function() {
                        var job = function() {
                            var o = queue.shift();
                            if (o) {
                                switch (typeof o) {
                                    case "number":
                                        scope.time.events.add(o, function() {
                                            job();
                                        }, this);
                                        break;

                                    case "function":
                                        o.call(scope);
                                        job();
                                        break;
                                }
                            }
                        };
                        job();
                    };
                    return start;
                })(arguments, scope);
                return {
                    start: start
                };
            };
        }
    },
    onSizeChange: function(scaleM, w, h) {
        console.log("size changed to", w, " x ", h, "----->", this.key);
    }
};

MONCLOA.Preload = function() {
    this.preloadBar = null;
};
MONCLOA.Preload.prototype = {
    init: function() {
        this.bsoIsDecoded = false;
        this.onCreate = false;
        
        this.advices = [
            "Comer huevos, chorizo y patatas fritas\ntodos los días puede resultar perjudicial\npara la salud",
            "No es recomendable vender a tus padres\nen \"Gualapó\" si no dispones de sustitutos\npara tus progenitores",
            "¡Cuidado con los signos de puntuación!\nNo es lo mismo \"pásame la sal gorda\" que\n\"pásame la sal, gorda\"",
            "Si te parece que el volumen de la música\nestá demasiado alto, es que ya eres\ndemasiado viejo",
            "Esfuérzate en buscar trabajo.\nCuando lo encuentres, esfúerzate en buscar a\nalguien que lo haga por ti",
            "Desde la torre más alta de Toronto\npodrás ver TorontoEntero",
            "Escucha, sonríe, asiente y luego...\n¡haz lo que te dé la gana!",
            "Evita que tu novio/a se case con tu amigo/a:\ntu amigo/a no te lo perdonaría",
            "Estos son mis principios y convicciones.\nSi no te gustan, tengo otros.",
            "Si no entiendes algo que entendería hasta\nun niño de 5 años...\ncorre a buscar un niño de 5 años",
            "Un coche y un chófer cuestan demasiado.\nVende tu coche",
            "¿Pagar la cuenta?\n¡Qué costumbre tan absurda!",
            "El verdadero amor sólo se presenta\nuna vez en la vida...\nluego ya no hay quien se lo quite de encima",
            "Vive para siempre o muere intentándolo",
            "Jamás perdones a Manuela Carmena",
            "Haz caso a tu cuñado.\nÉl sabe lo que tienes que hacer",
            "Beber alcohol hace interesante a\nla gente que te rodea",
            "Huye lentamente de las tentaciones\npara darles tiempo a que te alcancen"
        ];
        this.advices = Phaser.ArrayUtils.shuffle(this.advices);
        
        if (MONCLOA.DEBUG.on && MONCLOA.DEBUG.mute_sound) this.sound.mute = true;
    },
    preload: function() {    
        this.monkeyLoader = this.add.sprite(this.world.centerX, this.world.centerY, "monkeyLoader");
        this.monkeyLoader.animations.add("dance", [0, 1, 2, 3, 4, 5, 6], 8, true);
        this.monkeyLoader.play("dance");
        this.monkeyLoader.anchor.setTo(0.5);
        
        this.loadTxt = this.add.bitmapText(this.world.centerX, this.world.centerY + 25, "white", "0 %", 40);
        this.loadTxt.anchor.x = 0.5;
        this.loadTxt.smoothed = false;
        this.loadTxt.tint = 0xffffff;
        this.loadTxt.align = "center";
        
        this.startTimer = this.time.create();
        this.startTimer.add(1000, function() {
            this.drawAdvice();
            this.adviceTimer = this.time.create();
            this.adviceTimer.loop(6000, this.drawAdvice, this);
            this.adviceTimer.start();
        }, this);
        this.startTimer.start();
        
        this.load.onFileComplete.add(this.onFileComplete, this);
        
        this.load.path = "media/sounds/";
        this.load.audio("intro_bso", ["intro_monkey_mezcla.ogg", "intro_monkey_mezcla.mp3"]);
        this.load.audio("pp_bso", ["himno_pp_recortado_mezcla.ogg", "himno_pp_recortado_mezcla.mp3"]);
        this.load.audio("fight_bso", ["fight.ogg", "fight.mp3"]);
        this.load.audio("beach_bso", ["beach.ogg", "beach.mp3"]);
        this.load.audio("hit0", ["hit0.ogg", "hit0.mp3"]);
        this.load.audio("hit1", ["hit1.ogg", "hit1.mp3"]);
        this.load.audio("hit2", ["hit2.ogg", "hit2.mp3"]);
        this.load.audio("hit3", ["hit3.ogg", "hit3.mp3"]);
        this.load.audio("hitWin", ["hitWin.ogg", "hitWin.mp3"]);
        this.load.audio("click", ["click.ogg", "click.mp3"]);
        this.load.audio("ghost", ["ghost.ogg", "ghost.mp3"]);
        this.load.audio("splash", ["splash.ogg", "splash.mp3"]);
        
        this.load.path = "media/sounds/speech/";
        this.load.audio("0", ["0.ogg", "0.mp3"]);
        this.load.audio("1", ["1.ogg", "1.mp3"]);
        this.load.audio("2", ["2.ogg", "2.mp3"]);
        this.load.audio("3", ["3.ogg", "3.mp3"]);
        this.load.audio("4", ["4.ogg", "4.mp3"]);
        this.load.audio("5", ["5.ogg", "5.mp3"]);
        this.load.audio("6", ["6.ogg", "6.mp3"]);
        this.load.audio("7", ["7.ogg", "7.mp3"]);
        this.load.audio("8", ["8.ogg", "8.mp3"]);
        this.load.audio("9", ["9.ogg", "9.mp3"]);
        this.load.audio("10", ["10.ogg", "10.mp3"]);
        this.load.audio("11", ["11.ogg", "11.mp3"]);
        this.load.audio("12", ["12.ogg", "12.mp3"]);
        this.load.audio("13", ["13.ogg", "13.mp3"]);
        this.load.audio("14", ["14.ogg", "14.mp3"]);
        this.load.audio("15", ["15.ogg", "15.mp3"]);
        this.load.audio("16", ["16.ogg", "16.mp3"]);
        this.load.audio("17", ["17.ogg", "17.mp3"]);
        this.load.audio("18", ["18.ogg", "18.mp3"]);
        this.load.audio("19", ["19.ogg", "19.mp3"]);
        this.load.audio("20", ["20.ogg", "20.mp3"]);
        
        this.load.path = "media/";
        this.load.spritesheet("logo", "carpenterSoft_logo_200.png", 200, 200);
        this.load.spritesheet("bubbles", "bubbles.png", 128, 128);
        this.load.spritesheet("barracuda", "barracuda.png", 100, 50);
        this.load.spritesheet("fishes", "fishes.png", 128, 128);
        this.load.spritesheet("shark", "shark.png", 103, 40);
        this.load.spritesheet("octopus", "octopus.png", 64, 64);
        this.load.spritesheet("smoke", "smoke.png", 65, 240);
        this.load.spritesheet("flag", "flag.png", 90, 90);
        this.load.spritesheet("ghost", "ghost_girl.png", 96, 143);
        this.load.spritesheet("arrows", "arrows.png", 37, 71);
        this.load.spritesheet("btn_continue", "btn_menu_a.png", 437, 84);
        this.load.spritesheet("btn_new", "btn_menu_b.png", 358, 84);
        this.load.spritesheet("btn_no", "btn_no.png", 116, 84);
        this.load.spritesheet("btn_yes", "btn_yes.png", 96, 84);
        this.load.spritesheet("btn_tuto_ok", "btn_tuto_ok.png", 274, 64);
        this.load.spritesheet("rajoy", "rajoy.png", 512, 288);
        this.load.spritesheet("pirata0", "pirata0.png", 352, 224);
        this.load.spritesheet("pirata1", "pirata1.png", 352, 224);
        this.load.spritesheet("pirata2", "pirata2.png", 352, 224);
        this.load.spritesheet("pirata3", "pirata3.png", 352, 224);
        this.load.spritesheet("pirata4", "aznar.png", 352, 224);
        this.load.spritesheet("items", "items.png", 41, 25);
        this.load.spritesheet("touch_icon", "touch_icon_64.png", 64, 64);
        this.load.spritesheet("pirate_flag", "flag_spritesheet.png", 96, 84);
        this.load.images(["island_bg", "road_bg", "house_bg", "port_bg", "ocean_bg", "boat_bg", "fade", "atoxa", "moncloa_title", "pirate_thumb0", "pirate_thumb1", "pirate_thumb2", "pirate_thumb3", "pirate_thumb4", "pirate_thumb5", "tuto_stan", "achievement"],
                         ["island.png", "road.png", "house.png", "port.png", "ocean.png", "boat.png", "fade.png", "atoxa_drawing.png", "moncloa_title.png", "pirataThumb0.png", "pirataThumb1.png", "pirataThumb2.png", "pirataThumb3.png", "pirataThumb4.png", "pirataThumb5.png", "tuto_stan.png", "achievement.png"]);
        
        this.load.path = "data/";
        this.load.json("game_data", "game_data.json");
    },
    create: function() {    
        this.onCreate = true;
    },
    update: function() {
        if (this.onCreate && this.bsoIsDecoded) {
            this.onCreate = false;
            if (this.adviceTimer) this.adviceTimer.destroy();
            var fade = this.add.image(0, 0, "fade");
            fade.alpha = 0;
            var tweenFade = this.add.tween(fade).to({alpha:1}, 2000, null, false, 1000);
            tweenFade.onComplete.add(function() {
                this.state.start("MONCLOA.Intro", true, false);
            }, this);
            tweenFade.start();
        }
    },
    // end of mandatory functions -------------------------------------------------------------------------------------------------
    drawAdvice: function() {
        if (this.adviceTitle) this.adviceTitle.destroy();
        if (this.adviceText) this.adviceText.destroy();
        
        this.adviceTitle = this.add.bitmapText(this.world.centerX, this.game.height*.74, "white", "CONSEJO:", 24);
        this.adviceTitle.anchor.x = 0.5;
        this.adviceTitle.smoothed = false;
        this.adviceTitle.tint = MONCLOA.COLORS.magenta;
        this.adviceTitle.align = "center";  
        this.adviceTitle.alpha = 0;
        
        var txt = this.advices.pop();
        this.adviceText = this.add.bitmapText(this.world.centerX, this.game.height*.8, "white", txt, 24);
        this.adviceText.anchor.x = 0.5;
        this.adviceText.smoothed = false;
        this.adviceText.tint = MONCLOA.COLORS.iu;
        this.adviceText.align = "center";
        this.adviceText.alpha = 0;

        if (txt) {
            var tw = this.add.tween(this.adviceTitle).to({alpha: 1}, 500);
            var tw2 = this.add.tween(this.adviceText).to({alpha: 1}, 1000);
            tw.start();
            tw2.start();
        }
    },
    onFileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
        if (cacheKey == "intro_bso") {
            this.bso = this.add.audio("intro_bso");
            this.bso.onDecoded.add(function() {
                this.bsoIsDecoded = true;
            }, this);
        }
        
        this.loadTxt.text = progress + " %";
    }
};

MONCLOA.Intro = function() {};
MONCLOA.Intro.prototype = {
    init: function() {
        this.blinkTimer = this.time.create();
        this.blinkTimer.loop(Phaser.Timer.SECOND, this.doBlinkHelpText, this);
        this.blinkTimer.start();
        
        this.pressedTimes = 0;
        this.input.onUp.add(this.onSkipPressed, this);
    },
    create: function() {
        this.logo = this.add.sprite(this.world.centerX, this.world.centerY, "logo");
        this.logo.anchor.setTo(0.5);
        this.logo.animations.add("show", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 15, false);
        this.logo.visible = false;
        
        this.click = this.add.audio("click");
        
        if (MONCLOA.DEBUG.on && MONCLOA.DEBUG.skip_intro) {
            this.state.start("MONCLOA.Menu", true, false);
        } else {
            this.bso = this.add.audio("intro_bso");
            this.bso.play();
            this.startIntro();
        }
    },
    // ----------------------------------------------------------
    doBlinkHelpText: function() {
        if (this.helpText) this.helpText.visible = this.helpText.visible ? false : true;
    },
    onSkipPressed: function(pointer) {
        if (!this.bg || (!pointer.withinGame)) return;
        this.pressedTimes++;
        if (this.pressedTimes == 1) {
            var txt = "Pulsa otra vez para saltar...";
            this.helpText = this.add.bitmapText(this.world.centerX - 20, this.world.centerY + 120, "white", txt, 22);
            this.click.play();
        } else if (this.pressedTimes >= 2) {
            this.click.play();
            this.state.start("MONCLOA.Menu", true, false, this.bso);
        }
    },
    startIntro: function() {
        var queue = Phaser.Utils.enqueue([
            1500,
            function() {
                this.logo.visible = true;
                this.logo.play("show");
            },
            3500,
            function() {
                this.logo.destroy();
            },
            1500,
            function() {
                this.bg = this.add.image(this.world.centerX, this.world.centerY, "atoxa");
                this.bg.anchor.setTo(0.5);
            },
            1500,
            function() {
                var txt = "En algún lugar de las Rías Baixas...";
                this.introText = this.add.bitmapText(this.world.centerX, 30, "white", txt, 26);
                this.introText.anchor.setTo(0.5);
                this.introText.tint = MONCLOA.COLORS.magenta;
            },
            4000,
            function() {
                this.introText.destroy();
            },
            2000,
            function() {
                var txt = "Podría ser la isla de A Toxa...\no puede que no...";
                this.introText = this.add.bitmapText(this.world.centerX, 30, "white", txt, 26);
                this.introText.anchor.setTo(0.5);
                this.introText.align = "center";
                this.introText.tint = MONCLOA.COLORS.magenta;
            },
            4500,
            function() {
                this.introText.destroy();
            },
            2500,
            function() {
                this.title = this.add.image(this.world.centerX, this.world.centerY, "moncloa_title");
                this.title.anchor.setTo(0.5);
                this.title.alpha = 0;

                var tweenTitle = this.add.tween(this.title).to({alpha:1}, 500, null, true);
                var tweenTitleScale = this.add.tween(this.title.scale).to({x:3, y:3}, 1000, Phaser.Easing.Exponential.In, true);
            },
            1000,
            function() {
                var txt = "[El Secreto de Isla Moncloa]";
                this.introText = this.add.bitmapText(this.world.centerX, this.game.height - 120, "white", txt, 24);
                this.introText.anchor.setTo(0.5);
                this.introText.tint = MONCLOA.COLORS.magenta;
            },
            1500,
            function() {
                txt = "\"Ni a Hitler ni a Stalin les han nombrado\npersona non grata en Pontevedra\" - MR";
                this.introText2 = this.add.bitmapText(this.world.centerX, this.game.height - 50, "white", txt, 24);
                this.introText2.anchor.setTo(0.5);
                this.introText2.tint = MONCLOA.COLORS.limegreen;
                var speech = this.add.audio("10");
                speech.volume = 0.8;
                speech.play();
            },
            3000,
            function() {
                this.introText.destroy();
            },
            1500,
            function() {
                this.introText2.destroy();
            },
            1000,
            function() {
                this.title.destroy();
            },
            1000,
            function() {
                this.state.start("MONCLOA.Menu", true, false, this.bso);
            }
        ], this);
        queue.start();
    }
};

MONCLOA.Menu = function() {
    
};
MONCLOA.Menu.prototype = {
    init: function(bso) {
        this.bso = bso;
        
        this.saved_gameData = window.localStorage.getItem(MONCLOA.LOCALSTORAGE_STRING);
        if (this.saved_gameData) {
            this.saved_gameData = JSON.parse(this.saved_gameData);
        }
        
        this.MARIANO_FPS = 10;
    },
    create: function() {
        this.click = this.add.audio("click");
        
        if (this.saved_gameData) {
            this.bg = this.add.image(this.world.centerX, this.world.centerY, "atoxa");
            this.bg.anchor.setTo(0.5);
            var tweenBg = this.add.tween(this.bg).to({alpha: 0.4}, 1000);
            tweenBg.onComplete.addOnce(function() {
                this.addMenu();
                this.addMariano();
            }, this);
            tweenBg.start();
        } else {
            this.state.start("MONCLOA.Selection", true, false, this.bso);
        }
    },
    // ----------------------------------------
    addInfoPopup: function() {
        this.popupBG = this.add.image(this.world.centerX, this.world.centerY, "fade");
        this.popupBG.anchor.setTo(0.5);
        this.popupBG.scale.setTo(0.7);
        
        this.monkeyLoader = this.add.sprite(this.world.centerX, this.world.centerY/2, "monkeyLoader");
        this.monkeyLoader.anchor.setTo(0.5, 0);
        this.monkeyLoader.animations.add("dance", [0, 1, 2, 3, 4, 5, 6], 8, true);
        this.monkeyLoader.play("dance");
        var txt = "Al comenzar desde cero perderás\ntus progresos anteriores.\n¿Seguro?";
        this.loadTxt = this.add.bitmapText(this.world.centerX, this.world.centerY + 25, "white", txt, 24);
        this.loadTxt.anchor.x = 0.5;
        this.loadTxt.smoothed = false;
        this.loadTxt.tint = MONCLOA.COLORS.magenta;
        this.loadTxt.align = "center";
        
        this.btn_yes = this.add.button(this.world.centerX - 80, this.world.centerY * 1.5, "btn_yes", this.onButtonPress, this, 1, 0, 1, 0);
        this.btn_yes.anchor.setTo(0.5);
        this.btn_yes.name = "yes";
        this.btn_no = this.add.button(this.world.centerX + 80, this.world.centerY * 1.5, "btn_no", this.onButtonPress, this, 1, 0, 1, 0);
        this.btn_no.anchor.setTo(0.5);
        this.btn_no.name = "no";
    },
    addMariano: function() {
        this.marianoSprite = this.add.sprite(this.game.width/2, this.game.height - 2, "rajoy");
        this.marianoSprite.anchor.setTo(0.5, 1);
        var anim1 = this.marianoSprite.animations.add("retreat",    [29,29,30,31,32,33,34,35,36,37,38,39,40,41,42], this.MARIANO_FPS, false);
        var anim2 = this.marianoSprite.animations.add("advance",    [7,7,8,9,10,11,12,13,14,15,16,17,18,19,20], this.MARIANO_FPS, false);
        var anim3 = this.marianoSprite.animations.add("win",        [21,22,23,24,25,26,27,28], this.MARIANO_FPS, false);
        anim1.onComplete.add(this.launchMarianoAnim, this);
        anim2.onComplete.add(this.launchMarianoAnim, this);
        anim3.onComplete.add(this.launchMarianoAnim, this);
        this.launchMarianoAnim();
    },
    addMenu: function() {
        this.btn_continue = this.add.button(this.world.centerX, this.world.centerY - 50, "btn_continue", this.onButtonPress, this, 1, 0, 1, 0);
        this.btn_continue.anchor.setTo(0.5);
        this.btn_continue.name = "continue";
        this.btn_new = this.add.button(this.world.centerX, this.world.centerY + 50, "btn_new", this.onButtonPress, this, 1, 0, 1, 0);
        this.btn_new.anchor.setTo(0.5);
        this.btn_new.name = "new";
    },
    launchMarianoAnim: function() {
        var anims = ["retreat", "advance", "win"];
        this.marianoSprite.play(this.rnd.pick(anims));
    },
    loadSavedGameData: function() {
        if (this.saved_gameData) {
            for (var prop in this.saved_gameData) {
                MONCLOA[prop] = this.saved_gameData[prop];
            }
        } else {
            console.error("no saved game data found!!");
        }
    },
    onButtonPress: function(btn, pointer, isStillOver) {
        if (!isStillOver) return;
        
        this.click.play();
        if (btn.name == "continue") {
            this.loadSavedGameData();
            this.state.start("MONCLOA.Selection", true, false, this.bso);
        }
        if (btn.name == "new") {
            this.removeMenu();
            this.addInfoPopup();
        }
        if (btn.name == "yes") this.state.start("MONCLOA.Selection", true, false, this.bso);
        if (btn.name == "no") {
            this.removeInfoPopup();
            this.addMenu();
        }
    },
    removeInfoPopup: function() {
        this.popupBG.destroy();
        this.btn_yes.destroy();
        this.btn_no.destroy();
        this.loadTxt.destroy();
        this.monkeyLoader.destroy();
    },
    removeMenu: function() {
        this.btn_continue.destroy();
        this.btn_new.destroy();
    }
};

MONCLOA.Selection = function() {
    
};
MONCLOA.Selection.prototype = {
    init: function(bso) {
        this.isMobile = !this.game.device.desktop;
        
        if (bso) {
            this.bso = bso;
        } else {
            this.bso = this.add.audio("pp_bso");
            this.bso.play();
            this.launchMarianoSpeeches();
        }
        
        this.game_data = this.cache.getJSON("game_data");
        this.saveGameData();
        this.pirate_names = this.game_data.enemy_names;
        this.pirate_colors = this.game_data.enemy_colors;
        this.num_insults = this.game_data.insults.length;
                
        this.achievementStorage = window.localStorage.getItem(MONCLOA.ACHIEVEMENTS_STRING);
        if (this.achievementStorage) {
            this.achievementStorage = JSON.parse(this.achievementStorage);
        } else {
            this.achievementStorage = Phaser.Utils.mixin(MONCLOA.ACHIEVEMENTS, {});
            window.localStorage.setItem(MONCLOA.ACHIEVEMENTS_STRING, JSON.stringify(this.achievementStorage));
        }
    },
    create: function() {
        this.click = this.add.audio("click");
        this.add.image(0, 0, "island_bg");
        
        var txt = this.game_data.choose_enemy;
        var choose_txt = this.add.bitmapText(this.world.centerX, 20, "white", txt, 26);
        choose_txt.anchor.setTo(0.5);
        choose_txt.smoothed = false;
        choose_txt.tint = 0xFF69B4;
        
        this.addButtons();
        
        this.launchAchievement();
        
        if (MONCLOA.DEBUG.on) {
            if (MONCLOA.DEBUG.skip_to_round) this.state.start("MONCLOA.Round", true, false, MONCLOA.DEBUG.round_code || 0, this.bso);
            if (MONCLOA.DEBUG.skip_to_ending) {
                this.state.start("MONCLOA.Ending", true, false);
                this.bso.destroy();
            }
        }
    },
    render: function() {
        if (MONCLOA.DEBUG.on) {
            if (MONCLOA.DEBUG.show_coords) this.game.debug.inputInfo();
        }
    },
    // -------------------------------------------------------------------------
    addButtons: function() {
        var pos = [
            { x: 354, y: 136 },
            { x: 167, y: 283 },
            { x: 493, y: 413 },
            { x: 775, y: 518 },
            { x: 672, y: 67 }
        ];
        var buttons = [];
        for (var q=0; q<4; q++) {
            buttons[q] = this.add.button(pos[q].x, pos[q].y, "pirate_thumb"+q, this.onThumbPressed, this);
            buttons[q].onInputOver.add(this.onThumbOver, this);
            buttons[q].onInputOut.add(this.onThumbOut, this);
            if (this.isMobile) {
                this.addThumbText(buttons[q].position.x + buttons[q].width/2, buttons[q].position.y + buttons[q].height + 20, q);
            }
            
            if (MONCLOA.pirate_defeated[q]) {
                var flag = this.add.sprite(pos[q].x + buttons[q].width/2, pos[q].y - 20, "pirate_flag");
                flag.anchor.setTo(0, 1);
                var cut = this.rnd.integerInRange(0, 7);
                flag.animations.add("idle", [0,1,2,3,4,5,6,7].slice(cut).concat([0,1,2,3,4,5,6,7].slice(0, cut)), 12, true);
                flag.play("idle");
            }
        }
        
        
        if (MONCLOA.mariano_wins >= MONCLOA.MIN_WINS_FOR_AZNAR) {
            if (MONCLOA.aznar_discovered) {
                var thumb = "pirate_thumb5";
            } else {
                var thumb = "pirate_thumb4";
            }
            buttons[4] = this.add.button(pos[4].x, pos[4].y, thumb, this.onThumbPressed, this);
            buttons[4].onInputOver.add(this.onThumbOver, this);
            buttons[4].onInputOut.add(this.onThumbOut, this);
            
            if (this.isMobile) {
                this.addThumbText(buttons[4].position.x + buttons[4].width/2, buttons[4].position.y + buttons[4].height + 20, 4);
            }
        }
    },
    addThumbText: function(x, y, code) {
        var txt = this.add.bitmapText(x, y, "white", this.pirate_names[code], 24);
        txt.align = "center";
        txt.anchor.setTo(0.5, 0);
        txt.tint = MONCLOA.COLORS[this.pirate_colors[code]] || MONCLOA.COLORS.sm;
        return txt;
    },
    decideAchievement: function() {
        var ach = this.achievementStorage;
        var count = 0;
        for (var prop in ach) {
            if (!ach[prop].shown && MONCLOA.ACHIEVEMENT_CONDS[prop].apply(this)) {
                ach[prop].shown = true;
                window.localStorage.setItem(MONCLOA.ACHIEVEMENTS_STRING, JSON.stringify(this.achievementStorage));
                return MONCLOA.ACHIEVEMENTS[prop].text;
            }
            count++;
        }
    },
    launchAchievement: function() {
        if (!this.itemsArray || !this.itemsArray.length) this.itemsArray = Phaser.ArrayUtils.shuffle([0,1,2,3,4,5,6,7,8,9]);
        
        if (this.achievement)       this.achievement.destroy();
        if (this.textUnlocked)      this.textUnlocked.destroy();
        if (this.itemUnlocked)      this.itemUnlocked.destroy();
        if (this.achievementGroup)  this.achievementGroup.destroy();
        
        var txt = this.decideAchievement();
        if (!txt) return;
        
        var posY = 200;
        
        this.achievement = this.add.image(this.game.width, posY, "achievement");
        this.achievement.anchor.setTo(1, 0);
        this.achievement.scale.setTo(1.4);
        
        this.textUnlocked = this.add.bitmapText(this.game.width - 40, posY + 20, "white", "Logro\ndesbloqueado", 20);
        this.textUnlocked.anchor.setTo(1, 0);
        this.textUnlocked.align = "right";
        
        this.itemUnlocked = this.add.sprite(this.game.width - this.achievement.width + 10, posY + 28, "items", this.itemsArray.pop() || 0);
        this.itemUnlocked.scale.setTo(1.4);
        
        this.achievementGroup = this.add.group();
        this.achievementGroup.addMultiple([this.achievement, this.textUnlocked, this.itemUnlocked]);
        this.achievementGroup.position.x = this.achievement.width;
        
        var tweenGroup = this.add.tween(this.achievementGroup).to({x: 0}, 1000, Phaser.Easing.Elastic.Out);
        tweenGroup.onComplete.addOnce(function() {
            var tw1 = this.add.tween(this.textUnlocked).to({alpha:0}, 500, null, false, 750);
            tw1.onComplete.addOnce(function() {
                this.textUnlocked.text = txt || "Recién llegado\na Isla Moncloa";
                this.textUnlocked.alpha = 1;

                var tw2 = this.add.tween(this.achievementGroup).to({x: this.achievement.width}, 1000, Phaser.Easing.Elastic.In, false, 2000);
                tw2.onComplete.addOnce(function() {
                    this.achievement.destroy();
                    this.textUnlocked.destroy();
                    this.itemUnlocked.destroy();
                    this.achievementGroup.destroy();
                }, this);
                tw2.start();
            }, this);
            tw1.start();
        }, this);
        tweenGroup.start();
    },
    launchMarianoSpeeches: function() {
        var timer = this.time.create();
        timer.add(1000 + this.rnd.integerInRange(500, 1500), function() {
            var speech = this.add.audio(this.rnd.integerInRange(0, 19));
            //speech.volume = 0.7;
            speech.play();
        }, this);
        timer.start();
    },
    onThumbOut: function(btn, pointer) {
        var code = btn.key.split("pirate_thumb")[1];
        btn.tint = 0xFFFFFF;
        if (this.overTxt) this.overTxt.destroy();
    },
    onThumbOver: function(btn, pointer) {
        var code = btn.key.split("pirate_thumb")[1];
        btn.tint = 0x00FF00;
        
        if (this.overTxt) this.overTxt.destroy();
        if (!this.isMobile) {
            this.overTxt = this.addThumbText(btn.position.x + btn.width/2, btn.position.y + btn.height + 20, code);
        }
    },
    onThumbPressed: function(btn, pointer) {
        var code = btn.key.split("pirate_thumb")[1];
        if (code > 4) code = 4;
        this.click.play();
        this.state.start("MONCLOA.Round", true, false, code, this.bso);
    },
    saveGameData: function() {
        var data = {};
        for (var q=0, l=MONCLOA.LOCALSTORAGE_DATA_TO_SAVE.length; q<l; q++) {
            data[MONCLOA.LOCALSTORAGE_DATA_TO_SAVE[q]] = MONCLOA[MONCLOA.LOCALSTORAGE_DATA_TO_SAVE[q]];
        }
        window.localStorage.setItem(MONCLOA.LOCALSTORAGE_STRING, JSON.stringify(data));
    }
};

MONCLOA.Round = function() {};

MONCLOA.Round.prototype = {
    init: function(enemy_code, bso) {
        this.isTutorialFinished = window.localStorage.getItem(MONCLOA.TUTORIAL_STRING);
        if (this.isTutorialFinished) {
            MONCLOA.TUTO.on = false;
        }
        
        if (bso) {
            this.bso = bso;
            this.bso.fadeOut(5000);
            this.bso.onFadeComplete.addOnce(function() {
                this.bso.destroy();
            }, this);
        }
        this.fight_bso = this.add.audio("fight_bso");
        this.fight_bso.fadeIn(2000, true);
        
        this.pirate_lives = enemy_code < 4 ? MONCLOA.pirate_lives : MONCLOA.aznar_lives;
        this.pirate_atk_option = enemy_code < 4 ? "a" : "b";
        this.mariano_lives = MONCLOA.mariano_lives;
        
        this.NUM_OPT_PER_PAGE = 6;
        this.INIT_POS_X = 44;
        this.INIT_POS_Y = 570;
        this.FINAL_POS_Y = 710;
        
        this.DIALOGUE_POS_Y = 130;
        this.DIALOGUE_PIRATE_POS_Y = 120;
        if (enemy_code >= 4) this.DIALOGUE_PIRATE_POS_Y += 40;
        
        this.TIME_PER_WORD = 400;
        this.MARIANO_FPS = 10;
        this.ENEMY_FPS = 10;
        
        this.SWORD_FIGHT_PAUSE = 1700;
        
        this.buttons = [];
        this.texts = [];
        this.used = [];
        this.actions = [];
        this.currentPage = 0;
        this.marianoStatus = MONCLOA.STATUS_ATK;
        this.marianoSprStatus = 0;
        this.enemySprStatus = 0;
        
        this.step = (this.FINAL_POS_Y - this.INIT_POS_Y) / this.NUM_OPT_PER_PAGE;
        
        this.game_data = this.cache.getJSON("game_data");
        this.standard_attack = this.game_data.standard.attack;
        this.standard_defense = this.game_data.standard.defense;
        this.bad_choice = this.game_data.standard.bad_choice;
        this.insults = this.game_data.insults;
        this.tuto_dialogues = this.game_data.tuto_dialogues;
        this.text_color = MONCLOA.COLORS[this.game_data.enemy_colors[enemy_code]];
        this.pirate_knows = this.fillPirateAttackOptions();
        this.pirate_used = [];
        
        this.rajoyGirlTxt = "El Fantasma de\nla niña\nde Rajoy";
        
        this.enemy_code = enemy_code;
    },
    create: function() {
        this.click = this.add.audio("click");
        this.ghostGirlSound = this.add.audio("ghost");
        
        if (this.enemy_code < 4) {
            this.add.image(0, 0, "road_bg");
        } else {
            this.add.image(0, 0, "house_bg");
        }
        
        this.canvas = this.add.graphics(0, 0);
        this.canvas.beginFill(0x00FF00, 0.0);
        this.canvas.drawRect(0, 0, this.game.width - this.INIT_POS_X, this.step);
        this.btnTexture = this.canvas.generateTexture();
        this.canvas.destroy();
        
        this.marianoSprite = this.add.sprite(this.game.width/2 - 90, this.game.height*.7, "rajoy");
        this.marianoSprite.anchor.setTo(0.5, 1);
        this.marianoSprite.animations.add("idle_0",     [0], 0);
        this.marianoSprite.animations.add("speak_0",    [59,60,59,60,59,60,0,57,58,56,0,57,58,56,0], this.MARIANO_FPS, true);
        this.marianoSprite.animations.add("engarde",    [1,2,3,4,5], this.MARIANO_FPS, false);
        this.marianoSprite.animations.add("idle_1",     [5], 0);
        this.marianoSprite.animations.add("speak_1",    [66,67,66,67,66,67,64,65,63,64,65,63], this.MARIANO_FPS, true);
        this.marianoSprite.animations.add("retreat",    [29,29,30,31,32,33,34,35,36,37,38,39,40,41,42], this.MARIANO_FPS, false);
        this.marianoSprite.animations.add("idle_2",     [42], 0);
        this.marianoSprite.animations.add("speak_2",    [73,74,73,74,73,74,71,72,70,71,72,70], this.MARIANO_FPS, true);
        this.marianoSprite.animations.add("advance",    [7,7,8,9,10,11,12,13,14,15,16,17,18,19,20], this.MARIANO_FPS, false);
        this.marianoSprite.animations.add("idle_3",     [20], 0);
        this.marianoSprite.animations.add("speak_3",    [80,81,80,81,80,81,78,79,77,78,79,77], this.MARIANO_FPS, true);
        this.marianoSprite.animations.add("lose",       [43,44,45,46,47,48,49,50,51,52,53,54], this.MARIANO_FPS, false);
        this.marianoSprite.animations.add("idle_4",     [54], 0);
        this.marianoSprite.animations.add("speak_4",    [87,88,87,88,87,88,85,86,84,85,86,84], this.MARIANO_FPS, true);
        this.marianoSprite.animations.add("win",        [21,22,23,24,25,26,27,28], this.MARIANO_FPS, false);
        this.marianoSprite.animations.add("idle_5",     [28], 0);
        
        var pirateSpeak_0 = [51,52,0,50,0,52,51,52,0,51,52,0,50,49];
        if (this.enemy_code > 3) pirateSpeak_0 = [51,49,50,52,53,49,51,53,49,0,52,53,50,53,49,50];
        var pirateEngarde = [0,0,1,2,3,4,5];
        if (this.enemy_code > 3) pirateEngarde = [1,2,3,4];
        var pirateIdle_1 = [5];
        if (this.enemy_code > 3) pirateIdle_1 = [4];
        var pirateSpeak_0 = [51,52,0,50,0,52,51,52,0,51,52,0,50,49];
        if (this.enemy_code > 3) pirateSpeak_0 = [51,49,50,52,53,49,51,53,49,0,52,53,50,53,49,50];
        var pirateSpeak_1 = [58,59,5,57,5,59,58,59,5,58,59,5,57,56];
        if (this.enemy_code > 3) pirateSpeak_1 = [58,56,57,59,60,56,58,60,56,59,60,57,60,56,57];
        var pirateSpeak_2 = [65,66,20,64,20,66,65,66,20,65,66,20,64,63];
        if (this.enemy_code > 3) pirateSpeak_2 = [65,63,64,66,67,63,65,67,63,66,67,64,67,63,64];
        var pirateSpeak_3 = [72,73,41,71,41,73,72,73,41,72,73,41,71,70];
        if (this.enemy_code > 3) pirateSpeak_3 = [72,70,71,73,74,70,72,74,70,73,74,71,74,70,71];
        var pirateSpeak_4 = [79,80,27,78,27,80,79,80,27,79,80,27,78,77];
        if (this.enemy_code > 3) pirateSpeak_4 = [49,50,51,52,53];
        var pirateWin = [42,43,44,45,46,47,48];
        if (this.enemy_code > 3) pirateWin = [42,43,44,45,46,47,48,48,48,48,21,25,26,26,0];
        
        this.enemySprite = this.add.sprite(this.game.width/2 + 90, this.game.height*.7, "pirata"+this.enemy_code);
        this.enemySprite.anchor.setTo(0.5, 1);
        this.enemySprite.animations.add("idle_0",     [0], 0);
        this.enemySprite.animations.add("speak_0",    pirateSpeak_0, this.ENEMY_FPS, true);
        this.enemySprite.animations.add("engarde",    pirateEngarde, this.ENEMY_FPS, false);
        this.enemySprite.animations.add("idle_1",     pirateIdle_1, 0);
        this.enemySprite.animations.add("speak_1",    pirateSpeak_1, this.ENEMY_FPS, true);
        this.enemySprite.animations.add("retreat",    [7,7,8,9,10,11,12,13,14,15,16,17,18,19,20], this.ENEMY_FPS, false);
        this.enemySprite.animations.add("idle_2",     [20], 0);
        this.enemySprite.animations.add("speak_2",    pirateSpeak_2, this.ENEMY_FPS, true);
        this.enemySprite.animations.add("advance",    [28,28,29,30,31,32,33,34,35,36,37,38,39,40,41], this.ENEMY_FPS, false);
        this.enemySprite.animations.add("idle_3",     [41], 0);
        this.enemySprite.animations.add("speak_3",    pirateSpeak_3, this.ENEMY_FPS, true);
        this.enemySprite.animations.add("lose",       [21,22,23,24,25,26,27], this.ENEMY_FPS, false);
        this.enemySprite.animations.add("idle_4",     [27], 0);
        this.enemySprite.animations.add("speak_4",    pirateSpeak_4, this.ENEMY_FPS, true);
        this.enemySprite.animations.add("win",        pirateWin, this.ENEMY_FPS, false);
        this.enemySprite.animations.add("idle_5",     [48], 0);
        
        if (MONCLOA.DEBUG.on && MONCLOA.DEBUG.debug_anims) {
            var anims = ["idle_0", "speak_0", "engarde", "idle_1", "speak_1", "retreat", "idle_2", "speak_2", "advance", "idle_3", "speak_3", "lose", "idle_4", "speak_4", "win", "idle_5"];
            var cAnim = 0;
            this.input.onUp.add(function() {
                if (cAnim++ > anims.length) cAnim = 0;
                this.marianoSprite.play(anims[cAnim]);
                this.enemySprite.play(anims[cAnim]);
            }, this);
        }
        
        if (MONCLOA.DEBUG.on && MONCLOA.DEBUG.skip_say_hi) {
            this.nextRoundActions();
        } else {
            if (this.enemy_code < 4) {
                var queue = [
                    this.pirateSayHi,
                    3000
                ];
            } else {
                var queue = [
                    function() {
                        this.enemySprite.play("speak_0");
                        var txt = this.game_data.greetings_SM[0];
                        this.pirateSay(txt);
                    },
                    3000,
                    function() {
                        this.clearDialogue();
                        this.enemySprite.play("idle_0");
                    },
                    1000,
                    function() {
                        this.enemySprite.play("speak_0");
                        var txt = this.game_data.greetings_SM[1];
                        this.pirateSay(txt);
                    },
                    2500
                ];
            }
            queue.push(
                function() {
                    this.enemySprite.play("idle_0");
                },
                this.marianoSayHi
            );
            Phaser.Utils.enqueue(queue, this).start();
        }
        this.addButtons();
    },
    render: function() {
        if (MONCLOA.DEBUG.on) {
            if (MONCLOA.DEBUG.show_coords) this.game.debug.inputInfo();
        }
    },
    update: function() {
        if (this.ghost && this.ghost.alive) {
            var x = Math.floor(Math.cos(this.time.now / 500) * 10);
            var y = Math.floor(Math.sin(this.time.now / 400) * 8);
            this.ghost.position.x = 150 + x;
            this.ghost.position.y = 450 + y;
            this.ghostText.position.x = this.ghost.position.x;
            this.ghostText.position.y = this.ghost.position.y + 40;
        }
    },
    // -------------------------------------------------------------------
    addActions: function(actions) {
        if (typeof options == "array") {
            console.error("options is not an array");
            return;
        }
        
        for (var q=0; q<actions.length; q++) {
            if (!this[actions[q]]) {
                console.error("some actions are not defined!", actions[q]);
                return;
            }
        }
        
        this.actions = actions;
    },
    addArrows: function(opt) {
        if (opt.indexOf("up") >= 0) {
            this.arrow_up = this.add.button(0, 571, "arrows", this.onArrowPressed, this);
            this.arrow_up.name = "up";
            this.arrow_up.onInputOver.add(this.onArrowOver, this);
            this.arrow_up.onInputOut.add(this.onArrowOut, this);
        }

        if (opt.indexOf("down") >= 0) {
            this.arrow_down = this.add.button(0, 644, "arrows", this.onArrowPressed, this);
            this.arrow_down.name = "down";
            this.arrow_down.frame = 1;
            this.arrow_down.onInputOver.add(this.onArrowOver, this);
            this.arrow_down.onInputOut.add(this.onArrowOut, this);
        }
    },
    addButtons: function() {
        for (var q=0; q<this.NUM_OPT_PER_PAGE; q++) {
            var btn = this.add.image(this.INIT_POS_X, this.INIT_POS_Y + (q*this.step), this.btnTexture);
            btn.inputEnabled = true;
            btn.name = q;
            btn.events.onInputOver.add(this.onOptionOver, this);
            btn.events.onInputOut.add(this.onOptionOut, this);
            btn.events.onInputUp.add(this.onOptionPress, this);
            this.buttons.push(btn);
        }
    },
    addGhostGirl: function(callback) {
        this.ghost = this.add.sprite(0, 0, "ghost");
        this.ghost.alpha = 0.8;
        this.ghost.anchor.setTo(0.5, 1);
        this.ghost.animations.add("idle", [0], 0);
        this.ghost.animations.add("speak", [0, 1, 0, 1, 1, 0, 1, 0, 0, 1], 10, true);
        //this.ghost.play("speak");
        
        this.ghostText = this.add.bitmapText(0, 0, "white", this.rajoyGirlTxt, 20);
        this.ghostText.anchor.setTo(0.5);
        this.ghostText.align = "center";
        this.ghostText.smoothed = false;
        this.ghostText.tint = MONCLOA.COLORS.ghost;
        
        this.ghostGroup = this.add.group();
        this.ghostGroup.addMultiple([this.ghost, this.ghostText]);
        this.ghostGroup.alpha = 0;
        var tween = this.add.tween(this.ghostGroup).to({alpha: 1}, 2000);
        tween.onComplete.addOnce(function() {
            if (callback) callback();
        }, this);
        tween.start();
        this.ghostGirlSound.play();
    },
    addJokers: function(immediate) {
        this.destroyJokers();
        
        var anim = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
        this.jokers = [];
        this.jokerGroup = this.add.group();
        for (var q=0; q<MONCLOA.mariano_jokers; q++) {
            var joker = this.add.sprite(50 + q*100, 50, "flag");
            joker.alpha = 0.8;
            var cut = this.rnd.integerInRange(0, 15);
            joker.animations.add("idle", anim.slice(cut).concat(anim.slice(0, cut)), 12, true);
            joker.play("idle");
            joker.inputEnabled = true;
            joker.events.onInputUp.add(this.onJokerPress, this);
            this.jokers.push(joker);
        }
        this.jokerGroup.addMultiple(this.jokers);
        if (!immediate) {
            this.jokerGroup.alpha = 0;
            var tween = this.add.tween(this.jokerGroup).to({alpha: 1}, 500);
            tween.start();
        }
    },
    addOptions: function(options) {
        if (typeof options == "array") {
            console.error("options is not an array");
            return;
        }
        
        this.destroyButtonTexts();
        
        var pos = 0;
        for (var q=this.currentPage*this.NUM_OPT_PER_PAGE, l=options.length; q<l && q<this.NUM_OPT_PER_PAGE*(1+this.currentPage); q++) {
            var txt = options[q].txt && options[q].txt.replace(/\n/g, " ") || options[q].replace(/\n/g, " ");
            var btn = this.add.bitmapText(this.INIT_POS_X, this.INIT_POS_Y + (this.step*pos), "white", txt, 20);
            btn.smoothed = false;
            btn.tint = 0x800080;
            btn.name = options[q].i;
            btn.originalTxt = options[q].txt || options[q];
            this.texts.push(btn);
            pos++;
        }
        
        this.destroyArrows();
        if (l > this.NUM_OPT_PER_PAGE && this.currentPage < Math.floor(options.length/this.NUM_OPT_PER_PAGE)) this.addArrows(["down"]);
        if (this.currentPage > 0) this.addArrows(["up"]);
    },
    addTutorial: function(tutOption) {
        this.tutorialOnScreen = true;
        if (this.cTut) this.cTut.destroy();
        
        this.cTut = this.add.graphics(0, 0);
        this.cTut.beginFill(0x000000, 0.7);
        this.cTut.drawRect(0, 0, this.game.width, this.game.height);
        if (tutOption == "first_defense") {
            this.cTut.beginFill(0xFF0000, 0.2);
            this.cTut.drawRoundedRect(30, 30, 320, 120, 25);
        }
        this.cTut.alpha = 0;
        
        var tw = this.add.tween(this.cTut).to({alpha:1}, 1000);
        tw.onComplete.addOnce(function() {
            this.tuto_stan = this.add.image(0, this.game.height, "tuto_stan");
            this.tuto_stan.anchor.setTo(1);
            var twStan = this.add.tween(this.tuto_stan.position).to({x: this.tuto_stan.width}, 750, Phaser.Easing.Elastic.Out);
            twStan.onComplete.addOnce(function() {
                this.printTutoText(this.tuto_dialogues[tutOption]);
                
                this.btn_tuto_ok = this.add.button(this.world.centerX, this.game.height - 120, "btn_tuto_ok", this.onButtonPress, this, 1, 0, 1, 0);
                this.btn_tuto_ok.anchor.setTo(0.5);
                this.btn_tuto_ok.bringToTop();
            }, this);
            twStan.start();
        }, this);
        tw.start();
    },
    clearDialogue: function() {
        if (this.dialogue) this.dialogue.destroy();
    },
    destroyArrows: function() {
        if (this.arrow_up) this.arrow_up.destroy();
        if (this.arrow_down) this.arrow_down.destroy();
    },
    destroyButtonTexts: function() {
        for (var q=0, l=this.texts.length; q<l; q++) {
            this.texts[q].destroy();
        }
        this.texts = [];
    },
    destroyGhostGirl: function() {
        if (this.ghostGroup) {
            var tween = this.add.tween(this.ghostGroup).to({alpha: 0}, 2000);
            tween.onComplete.addOnce(function() {
                this.ghost.destroy();
                this.ghostText.destroy();
                this.ghostGroup.destroy();
            }, this);
            tween.start();
        }
    },
    destroyJokers: function() {
        if (this.jokerGroup && this.jokerGroup.alive) {
            for (var q=0, l=this.jokers.length; q<l; q++) {
                this.jokers[q].destroy();
            }
            this.jokers = [];
            this.jokerGroup.destroy();
        }
    },
    disableButtons: function() {
        for (var q=0, l=this.buttons.length; q<l; q++) {
            this.buttons[q].sendToBack();
        }
    },
    enableButtons: function() {
        for (var q=0, l=this.buttons.length; q<l; q++) {
            this.buttons[q].bringToTop();
        }
    },
    enGarde: function() {
        this.marianoSprite.play("engarde");
        this.marianoSprStatus = 1;
        this.enemySprite.play("engarde");
        this.enemySprStatus = 1;
        if (this.enemy_code < 4) {
            this.nextRoundActions();
        } else {
            Phaser.Utils.enqueue([
                1500,
                this.pirateInsult
            ], this).start();
        }
        
        this.destroyGhostGirl();
    },
    exitFight: function() {
        this.fight_bso.destroy();
        this.state.start("MONCLOA.Selection", true, false);
    },
    fillAttackOptions: function() {
        var opt = [];
        var known = MONCLOA.known_insults;
        for (var q=0, l=known.length; q<l; q++) {
            if (this.used.indexOf(known[q]) < 0) {
                opt.push({
                    txt:    this.insults[known[q]].a,
                    i:      known[q]
                });
            }
        }
        for (q=0, l=this.standard_attack.length; q<l; q++) {
            opt.push({
                txt:    this.standard_attack[q],
                i:      -1
            });
        }
        return opt;
    },
    fillAttackActions: function() {
        this.marianoStatus = MONCLOA.STATUS_ATK;
        
        var actionsToAdd = [];
        var known = MONCLOA.known_insults;
        for (var q=0; q<known.length; q++) {
            if (this.used.indexOf(known[q]) < 0) {
                actionsToAdd.push("launchInsult");
            }
        }
        for (q=0, l=this.standard_attack.length; q<l-1; q++) {
            actionsToAdd.push("launchBadInsult");
        }
        actionsToAdd.push("exitFight");
        actionsToAdd = actionsToAdd.splice(this.currentPage*this.NUM_OPT_PER_PAGE, this.NUM_OPT_PER_PAGE);
        
        return actionsToAdd;
    },
    fillDefenseActions: function() {
        this.marianoStatus = MONCLOA.STATUS_DEF;
        if (MONCLOA.mariano_jokers > 0) this.addJokers();
        
        var actionsToAdd = [];
        var known = MONCLOA.known_responses;
        for (var q=0, l=known.length; q<l; q++) {
            actionsToAdd.push("launchResponse");
        }
        for (q=0, l=this.standard_defense.length; q<l-2; q++) {
            actionsToAdd.push("launchBadResponse");
        }
        actionsToAdd.push("sayRepeatPlease");
        actionsToAdd.push("exitFight");
        actionsToAdd = actionsToAdd.splice(this.currentPage*this.NUM_OPT_PER_PAGE, this.NUM_OPT_PER_PAGE);
        
        return actionsToAdd;
    },
    fillDefenseOptions: function() {
        var opt = [];
        var known = MONCLOA.known_responses;
        for (var q=0, l=known.length; q<l; q++) {
            opt.push({
                txt:    this.insults[known[q]].c,
                i:      known[q]
            });
        }
        for (q=0, l=this.standard_defense.length; q<l; q++) {
            opt.push({
                txt:    this.standard_defense[q],
                i:      -1
            });
        }
        return opt;
    },
    fillPirateAttackOptions: function() {
        var insults_to_remove = this.insults.length - Math.floor(MONCLOA.pirate_difficulty * this.insults.length);
        var sel = Phaser.ArrayUtils.numberArrayStep(0, this.insults.length, 1);
        while (insults_to_remove--) {
            var which = this.rnd.between(0, sel.length);
            sel.splice(which, 1);
        }
        var opt = {};
        var count = 0;
        var array = [];
        for (var q=0; q<this.insults.length; q++) {
            if (sel.indexOf(q) >= 0) {
                array.push(q);
            }
        }
        opt.array = array;
        opt.used = [];
        return opt;
    },
    ghostGirlSay: function(txt) {
        this.clearDialogue();
        this.destroyJokers();
        
        this.ghost.play("speak");
        this.dialogue = this.add.bitmapText(20, this.DIALOGUE_POS_Y, "white", txt, 20);
        this.dialogue.smoothed = false;
        this.dialogue.tint = MONCLOA.COLORS.ghost;
    },
    launchBadInsult: function() {
        var txt = this.rnd.pick(this.bad_choice);
        
        Phaser.Utils.enqueue([
            this.clearDialogue,
            1000,
            function() {
                this.dialogue = this.add.bitmapText(this.game.width - 40, this.DIALOGUE_POS_Y, "white", txt, 20);
                this.dialogue.position.x -= this.dialogue.textWidth;
                this.dialogue.smoothed = false;
                this.dialogue.tint = this.text_color;
                this.enemySprite.play("speak_" + this.enemySprStatus);
            },
            3000,
            this.clearDialogue,
            this.pirateAdvances,
            this.SWORD_FIGHT_PAUSE, 
            function() {
                this.enemySprite.play("idle_" + this.enemySprStatus);
            },
            1000, 
            this.pirateInsult
        ], this).start();
    },
    launchInsult: function(which) {
        this.used.push(which);
        this.pirateResponse(which);
    },
    launchGhostGirl: function() {
        var self = this;
        var callback = function() {
            Phaser.Utils.enqueue([
                1000,
                function() {
                    this.ghostGirlSay(this.insults[this.pirate_choice].c);                    
                }, 
                3000,
                function() {
                    this.ghost.play("idle");
                    this.destroyGhostGirl();
                    var responses = MONCLOA.known_responses;
                    if (responses.indexOf(this.pirate_choice) < 0) {
                        responses.push(this.pirate_choice);
                    }
                    this.launchResponse(this.pirate_choice);
                }
            ], self).start();  
        };
        
        this.addGhostGirl(callback);
    },
    launchResponse: function(which) {
        var mariano_knows_response = (which == this.pirate_choice);
        
        var queue = [
            this.clearDialogue,
            1000
        ];
        
        if (mariano_knows_response) {
            if (--this.pirate_lives > 0) {
                queue.push(this.pirateRetreats, this.SWORD_FIGHT_PAUSE, this.nextRoundActions);
            } else {
                MONCLOA.mariano_wins++;
                if (this.enemy_code < 4) MONCLOA.pirate_defeated[this.enemy_code] = true;
                this.marianoWinsQueue(queue);
            }
        } else {
            if (--this.mariano_lives > 0) {
                queue.push(this.pirateAdvances, this.SWORD_FIGHT_PAUSE, this.pirateInsult);
            } else {
                MONCLOA.mariano_defeats++;
                this.marianoDefeatQueue(queue);
            }
        }
        Phaser.Utils.enqueue(queue, this).start();
    },
    launchBadResponse: function() {
        var queue = [
            this.clearDialogue,
            1000
        ];
        
        if (--this.mariano_lives > 0) {
            queue.push(this.pirateAdvances, this.SWORD_FIGHT_PAUSE, this.pirateInsult);
        } else {
            MONCLOA.mariano_defeats++;
            this.marianoDefeatQueue(queue);
        }
        Phaser.Utils.enqueue(queue, this).start();
    },
    maestroResponse: function() {
        this.clearDialogue();
        var dialogues = this.game_data.dialogue_SM;        
        
        var queue = [
            1000,
            function() {
                this.enemySprite.play("speak_0");
                this.pirateSay(dialogues[0]);
            },
            3500,
            function() {
                this.enemySprite.play("speak_0");
                this.pirateSay(dialogues[1]);
            },
            3000,
            function() {
                this.enemySprite.play("speak_0");
                this.pirateSay(dialogues[2]);
            },
            5500,
            function() {
                this.clearDialogue();
                this.enemySprite.play("idle_0");
            },
            1000,
            function() {
                this.marianoSay(dialogues[3]);
            },
            3000,
            function() {
                this.marianoSprite.play("idle_0");
                this.enemySprite.play("speak_0");
                this.pirateSay(dialogues[4]);
            },
            2000,
            function() {
                this.clearDialogue();
                this.enGarde();
            }
        ];
        
        Phaser.Utils.enqueue(queue, this).start();
    },
    marianoDefeatQueue: function(q) {
        var txt = this.rnd.pick(this.game_data.defeat);
        q.push(
            this.pirateWins,
            2000,
            function() {
                this.marianoSay(txt);
            }, 3000);
        if (this.enemy_code >= 4) {
            q.push(
                function() {
                    this.clearDialogue();
                    this.marianoSprite.play("idle_" + this.marianoSprStatus);
                    this.enemySprStatus = 0;
                    this.pirateSay(this.game_data.defeat_SM[0]);
                },
                3000,
                function() {
                    this.pirateSay(this.game_data.defeat_SM[1]);
                },
                2000);
                    
        }
        if (MONCLOA.TUTO.on && MONCLOA.TUTO.first_defeat) {
            MONCLOA.TUTO.first_defeat = false;
            this.exitOnButtonPress = true;
            q.push(function() {
                this.clearDialogue();
                this.marianoSprite.play("idle_" + this.marianoSprStatus);
                this.addTutorial("first_defeat");
            });
        } else {
            q.push(this.exitFight);            
        }
    },
    marianoSay: function(txt) {
        this.clearDialogue();
        
        this.marianoSprite.play("speak_" + this.marianoSprStatus);
        this.dialogue = this.add.bitmapText(20, this.DIALOGUE_POS_Y, "white", txt, 20);
        this.dialogue.smoothed = false;
        this.dialogue.tint = MONCLOA.COLORS.pp;
    },
    marianoSayHi: function() {
        this.clearDialogue();
        
        if (!this.isTutorialFinished && this.enemy_code < 4) {
            this.touchTimer = this.time.create();
            this.touchTimer.add(3500, function() {
                this.touchIcon = this.add.sprite(this.game.width - 256, this.INIT_POS_Y + 32, "touch_icon");
                this.touchIcon.animations.add("idle", [0, 0, 1, 2, 2, 1], 6, true);
                this.touchIcon.play("idle");
            }, this);
            this.touchTimer.start();
        }
        
        this.addOptions(this.enemy_code < 4 ? this.game_data.init_dialogue : (MONCLOA.aznar_discovered ? this.game_data.init_dialogue_SM_2nd : this.game_data.init_dialogue_SM));
        this.addActions(this.enemy_code < 4 ? ["enGarde", "exitFight"] : ["maestroResponse", "enGarde", "exitFight"]);
        
        if (this.enemy_code >= 4) MONCLOA.aznar_discovered = true;
    },
    marianoResponse: function() {
        this.currentPage = 0;
        this.currentOptions = this.fillDefenseOptions();
        this.addOptions(this.currentOptions);
        
        this.currentActions = this.fillDefenseActions();
        this.addActions(this.currentActions);
        
        if (MONCLOA.TUTO.on && MONCLOA.TUTO.first_defense) {
            MONCLOA.TUTO.first_defense = false;
            MONCLOA.TUTO.force_pirate_answer = false;
            this.addTutorial("first_defense");
        }
    },
    marianoWinsQueue: function(q) {
        q.push(
            this.pirateLoses,
            2000,
            function() {
                this.pirateSay(this.enemy_code < 4 ? this.game_data.victory[0] : this.game_data.victory_SM[0]);
            }, 3000
        );

        if (MONCLOA.mariano_wins >= MONCLOA.MIN_WINS_FOR_AZNAR && this.enemy_code < 4) {
            q.push(this.clearDialogue, 
                1000, 
                function() {
                    this.enemySprite.play("idle_" + this.enemySprStatus);
                },
                1000,
                function() {
                    this.pirateSay(this.game_data.victory[1]);
                },
                2500
            );
        }
        q.push(
            function() {
                this.enemySprite.play("idle_" + this.enemySprStatus);
            },
            500
        );
        
        if (MONCLOA.TUTO.on && MONCLOA.TUTO.first_victory) {
            MONCLOA.TUTO.first_victory = false;
            window.localStorage.setItem(MONCLOA.TUTORIAL_STRING, "tutorial is finished");
            this.exitOnButtonPress = true;
            q.push(function() {
                this.clearDialogue();
                this.marianoSprite.play("idle_" + this.marianoSprStatus);
                this.addTutorial("first_victory");
            });
        } else if (this.enemy_code < 4) {
            q.push(this.exitFight);
        }
        
        if (this.enemy_code >= 4) {
            q.push(
                function() {
                    this.enemySprite.play("idle_" + this.enemySprStatus);
                },
                1000,
                function() {
                    this.pirateSay(this.game_data.victory_SM[1]);
                },
                2500,
                function() {
                    this.enemySprite.play("idle_" + this.enemySprStatus);
                },
                1000,
                function() {
                    this.pirateSay(this.game_data.victory_SM[2]);
                },
                2500,
                function() {
                    this.enemySprite.play("idle_" + this.enemySprStatus);
                    var fade = this.add.image(0, 0, "fade");
                    fade.alpha = 0;
                    this.fight_bso.fadeOut(1500);
                    var tween = this.add.tween(fade).to({alpha: 1}, 1500);
                    tween.onComplete.addOnce(function() {
                        this.state.start("MONCLOA.Ending", true, false);
                    }, this);
                    tween.start();
                }
            );
        }
    },
    nextRoundActions: function() {
        if (this.enemy_code >= 4) {
            this.pirateInsult();
            return;
        }
        
        this.currentPage = 0;
        this.currentOptions = this.fillAttackOptions();
        this.addOptions(this.currentOptions);
        
        this.currentActions = this.fillAttackActions();
        this.addActions(this.currentActions);
        
        if (MONCLOA.TUTO.on && MONCLOA.TUTO.first_insult) {
            if (MONCLOA.TUTO.first_insult) {
                MONCLOA.TUTO.first_insult = false;
                this.addTutorial("first_insult");
            }
            if (MONCLOA.TUTO.first_joker) {
                this.addTutorial("first_joker");
                MONCLOA.TUTO.first_joker = false;
            }
        }
    },
    onArrowPressed: function(btn, input, stillOverObj) {
        if (!stillOverObj || this.tutorialOnScreen) return;
        
        this.click.play();
        if (btn.name == "down" && this.currentPage < (this.currentOptions.length / this.NUM_OPT_PER_PAGE)) {
            this.currentPage++;
        } else if (btn.name == "up" && this.currentPage > 0) {
            this.currentPage--;
        }
        this.currentActions = (this.marianoStatus == MONCLOA.STATUS_ATK) ? this.fillAttackActions() : this.fillDefenseActions();
        this.addOptions(this.currentOptions);
        this.addActions(this.currentActions);
    },
    onArrowOver: function(btn, input) {
        if (this.tutorialOnScreen) return;
        
        this.game.canvas.style.cursor = "default";
        btn.tint = 0xFC00CF;
    },
    onArrowOut: function(btn, input) {
        if (this.tutorialOnScreen) return;
        
        btn.tint = 0xFFFFFF;
    },
    onButtonPress: function(btn, pointer, stillOverObj) {
        if (!stillOverObj) return;
        
        this.click.play();
        this.clearDialogue();
        
        if (this.btn_tuto_ok) this.btn_tuto_ok.destroy();
        if (this.tuto_stan) {
            var tweenStan = this.add.tween(this.tuto_stan.position).to({x:0}, 500, Phaser.Easing.Elastic.In);
            tweenStan.onComplete.addOnce(function() {
                this.tuto_stan.destroy();
            }, this);
            tweenStan.start();
        }
        if (this.cTut) {
            var tw = this.add.tween(this.cTut).to({alpha:0}, 1000);
            tw.onComplete.addOnce(function() {
                this.cTut.destroy();
                this.tutorialOnScreen = false;
                if (MONCLOA.TUTO.on && this.exitOnButtonPress) {
                    this.exitFight();
                }
            }, this);
            tw.start();
        }
        
    },
    onJokerPress: function(btn, pointer, stillOverObj) {
        if (!stillOverObj || (this.ghost && this.ghost.alive) || this.tutorialOnScreen) return;
        
        if (MONCLOA.TUTO.on && MONCLOA.mariano_jokers == 3) {
            MONCLOA.TUTO.first_joker = true;
        }
        
        this.click.play();
        if (--MONCLOA.mariano_jokers < 0) MONCLOA.mariano_jokers = 0;
        this.destroyJokers();
        this.addJokers("noTween");
        this.destroyButtonTexts();
        this.destroyArrows();
        
        this.launchGhostGirl();
    },
    onOptionOver: function(btn, pointer) {
        if (this.tutorialOnScreen) return;
        var txt = this.texts[btn.name];
        if (txt) {
            txt.tint = MONCLOA.COLORS.magenta;   
        }
    },
    onOptionOut: function(btn, pointer) {
        if (this.tutorialOnScreen) return;
        var txt = this.texts[btn.name];
        if (txt) {
            txt.tint = MONCLOA.COLORS.purple;   
        }
    },
    onOptionPress: function(btn, pointer, stillOverObj) {
        if (!stillOverObj || this.tutorialOnScreen) return;

        if (this.touchTimer) this.touchTimer.destroy();
        if (this.touchIcon) this.touchIcon.destroy();
        
        var txt = this.texts[btn.name] && (this.texts[btn.name].originalTxt || this.texts[btn.name].text);
        var index = this.texts[btn.name] && this.texts[btn.name].name;
        if (!isFinite(index)) index = -1;
        var action = this.actions[btn.name];
        if (txt && action) {
            this.click.play();
            this.destroyJokers();
            this.destroyButtonTexts();
            this.destroyArrows();
            this.marianoSay(txt);
            var queue = Phaser.Utils.enqueue([
                txt.split(" ").length * this.TIME_PER_WORD,
                this.clearDialogue,
                function() {
                    this.marianoSprite.play("idle_" + this.marianoSprStatus);
                    this[action](index);
                }
            ], this).start();
        }
    },
    pirateInsult: function() {
        var available = this.pirate_knows.array.filter(function(el, i) {
            return this.pirate_knows.used.indexOf(el) < 0;
        }, this);
        if (!available.length) {
            console.error("not available insults for pirate!");
            return;
        }
        var pick = this.rnd.pick(available);
        
        if (MONCLOA.TUTO.on && MONCLOA.TUTO.force_pirate_attack) {
            MONCLOA.TUTO.force_pirate_attack = false;
            var responses = MONCLOA.known_responses;
            for (var q=0, l=this.insults.length; q<l; q++) {
                if (responses.indexOf(q) < 0) {
                    pick = q;
                    break;
                }
            }
        }
        
        this.pirate_knows.used.push(pick);
        var known = MONCLOA.known_insults;
        if (known.indexOf(pick) < 0 && this.enemy_code < 4) known.push(pick);
        var txt = this.insults[pick][this.pirate_atk_option];
        this.pirateSay(txt);
        this.pirate_choice = pick;
        
        Phaser.Utils.enqueue([
            txt.split(" ").length * this.TIME_PER_WORD,
            this.clearDialogue,
            function() {
                this.enemySprite.play("idle_" + this.enemySprStatus);
            },
            this.marianoResponse
        ], this).start();
    },
    pirateResponse: function(which) {
        var pirate_knows_response = this.pirate_knows.array.indexOf(which) >= 0 || (MONCLOA.TUTO.on && MONCLOA.TUTO.force_pirate_answer);
        MONCLOA.TUTO.force_pirate_answer = false;
        
        var queue = [
            1000,
            function() {
                if (pirate_knows_response) {
                    var txt = this.insults[which].c;
                    var responses = MONCLOA.known_responses;
                    if (responses.indexOf(which) < 0) responses.push(which);
                } else {
                    var txt = this.rnd.pick(this.standard_defense.slice(0, this.standard_defense.length-2));
                }
                this.dialogue = this.add.bitmapText(this.game.width - 40, this.DIALOGUE_PIRATE_POS_Y, "white", txt, 20);
                this.dialogue.position.x -= this.dialogue.textWidth;
                this.dialogue.smoothed = false;
                this.dialogue.tint = this.text_color;                
                this.enemySprite.play("speak_" + this.enemySprStatus);
            },
            3000,
            this.clearDialogue,
            function() {
                this.enemySprite.play("idle_" + this.enemySprStatus);
            }
        ];
        
        if (pirate_knows_response) {
            if (--this.mariano_lives > 0) {
                queue.push(this.pirateAdvances, this.SWORD_FIGHT_PAUSE, this.pirateInsult);
            } else {
                this.marianoDefeatQueue(queue);
            }
        } else {
            if (--this.pirate_lives > 0) {
                queue.push(this.pirateRetreats, this.SWORD_FIGHT_PAUSE, this.nextRoundActions);
            } else {
                MONCLOA.mariano_wins++;
                if (this.enemy_code < 4) MONCLOA.pirate_defeated[this.enemy_code] = true;
                this.marianoWinsQueue(queue);
            }
        }
        
        Phaser.Utils.enqueue(queue, this).start();
    },
    pirateAdvances: function() {
        this.playSwordEffect();
        this.enemySprStatus = 3;
        this.marianoSprStatus = 2;
        this.enemySprite.play("advance");
        this.marianoSprite.play("retreat");
        
        var timer = this.time.create();
        timer.repeat(250, 4, function() {
            this.marianoSprite.position.x -= 10;
            this.enemySprite.position.x -= 10;
        }, this);
        timer.start();
    },
    pirateLoses: function() {
        this.playSwordEffect(true);
        this.enemySprStatus = 4;
        this.enemySprite.play("lose");
        this.marianoSprite.play("win");
    },
    pirateRetreats: function() {
        this.playSwordEffect();
        this.enemySprStatus = 2;
        this.marianoSprStatus = 3;
        this.enemySprite.play("retreat");
        this.marianoSprite.play("advance");
        
        var timer = this.time.create();
        timer.repeat(250, 4, function() {
            this.marianoSprite.position.x += 10;
            this.enemySprite.position.x += 10;
        }, this);
        timer.start();
    },
    pirateWins: function() {
        this.playSwordEffect(true);
        this.marianoSprStatus = 4;
        this.enemySprite.play("win");
        this.marianoSprite.play("lose");
    },
    pirateSay: function(txt) {
        this.clearDialogue();
        
        this.enemySprite.play("speak_" + this.enemySprStatus);
        this.dialogue = this.add.bitmapText(this.game.width - 40, this.DIALOGUE_PIRATE_POS_Y, "white", txt, 20);
        this.dialogue.position.x -= this.dialogue.textWidth;
        this.dialogue.smoothed = false;
        this.dialogue.tint = this.text_color;
    },
    pirateSayHi: function() {
        this.enemySprite.play("speak_0");
        var txt = this.rnd.pick(this.game_data.greetings);
        this.pirateSay(txt);
    },
    printTutoText: function(txt) {
        this.clearDialogue();
        
        this.dialogue = this.add.bitmapText(80, 80, "white", txt, 24);
        this.dialogue.smoothed = false;
        this.dialogue.tint = MONCLOA.COLORS.iu;
    },
    sayRepeatPlease: function() {
        var txt = this.insults[this.pirate_choice][this.pirate_atk_option];
        Phaser.Utils.enqueue([
            this.clearDialogue,
            500,
            function() {
                this.pirateSay(this.game_data.repeat);
            },
            1500,
            function() {
                this.pirateSay(txt);
            },
            txt.split(" ").length * this.TIME_PER_WORD,
            this.clearDialogue,
            function() {
                this.enemySprite.play("idle_" + this.enemySprStatus);
            },
            this.marianoResponse
        ], this).start();
    },
    playSwordEffect: function(win) {
        if (win) {
            this.effect = this.add.audio("hitWin");
            this.effect.play();
            return;
        }
        
        this.effect = this.add.audio("hit"+this.rnd.pick([0,1,2,3]));
        this.effect.play();
        
        var timer = this.time.create();
        timer.add(this.SWORD_FIGHT_PAUSE, function() {
            this.effect.destroy();
        }, this);
        timer.start();
    }
};

MONCLOA.Ending = function() {
    
};
MONCLOA.Ending.prototype = {
    init: function() {
        this.game_data = this.cache.getJSON("game_data");
        this.dialogueTxt = this.game_data.ending_dialogue;
        
        this.bso = this.add.audio("beach_bso");
        this.bso.volume = 0.3;
        this.bso.play();
        
        this.MARIANO_FPS = 10;
        this.AZNAR_FPS = 10;
    },
    create: function() {
        var bg = this.add.image(this.world.centerX, this.world.height, "port_bg");
        bg.anchor.setTo(0.5, 1);
        
        this.marianoSprite = this.add.sprite(this.game.width/2 - 50, this.game.height*.9, "rajoy");
        this.marianoSprite.anchor.setTo(0.5, 1);
        this.game.physics.enable(this.marianoSprite);
        this.marianoSprite.animations.add("idle_0",     [0], 0);
        this.marianoSprite.animations.add("speak_0",    [59,60,59,60,59,60,0,57,58,56,0,57,58,56,0], this.MARIANO_FPS, true);
        this.marianoSprite.animations.add("jump",       [61,62,68,69], this.MARIANO_FPS, false);
        
        this.aznarSprite = this.add.sprite(this.game.width/2 + 20, this.game.height*.9, "pirata4");
        this.aznarSprite.anchor.setTo(0.5, 1);
        this.aznarSprite.animations.add("idle_0",     [0], 0);
        this.aznarSprite.animations.add("speak_0",    [51,49,50,52,53,49,51,53,49,0,52,53,50,53,49,50], this.AZNAR_FPS, true);
        this.aznarSprite.animations.add("engarde",    [1,2,3,4], this.AZNAR_FPS, false);
        this.aznarSprite.animations.add("lose",       [21,22,23,24,25,26,27,0], this.AZNAR_FPS, false);
        
        this.fade = this.add.image(0, 0, "fade");
        this.fade.alpha = 1;
        var tween = this.add.tween(this.fade).to({alpha: 0}, 1500);
        tween.onComplete.addOnce(this.startDialogue, this);
        tween.start();        
    },
    render: function() {
        if (MONCLOA.DEBUG.on) {
            if (MONCLOA.DEBUG.show_coords) this.game.debug.inputInfo();
        }
    },
    // ---------------------------------------------------------------------------
    clearDialogue: function() {
        this.aznarSprite.play("idle_0");
        this.marianoSprite.play("idle_0");
        if (this.dialogue) this.dialogue.destroy();
    },
    marianoSay: function(txt) {
        this.clearDialogue();
        
        this.marianoSprite.play("speak_0");
        this.dialogue = this.add.bitmapText(190, 220, "white", txt, 20);
        this.dialogue.smoothed = false;
        this.dialogue.tint = MONCLOA.COLORS.pp;
        this.dialogue.align = "left";
    },
    pirateSay: function(txt) {
        this.clearDialogue();
        
        this.aznarSprite.play("speak_0");
        this.dialogue = this.add.bitmapText(this.game.width * .75, 160, "white", txt, 20);
        this.dialogue.position.x -= this.dialogue.textWidth;
        this.dialogue.smoothed = false;
        this.dialogue.tint = MONCLOA.COLORS.sm;
        this.dialogue.align = "center";
    },
    startDialogue: function() {
        var queue = [
            1000,
            function() {
                var txt = this.dialogueTxt[0];
                this.pirateSay(txt);
            },
            2500,
            function() {
                this.clearDialogue();
            },
            1500,
            function() {
                var txt = this.dialogueTxt[1];
                this.pirateSay(txt);
            },
            3000,
            function() {
                this.clearDialogue();
            },
            2000,
            function() {
                var txt = this.dialogueTxt[2];
                this.pirateSay(txt);
                this.camera.shake(0.025, 600, true, Phaser.Camera.SHAKE_HORIZONTAL );
            },
            3000,
            function() {
                this.clearDialogue();
            },
            3000,
            function() {
                var txt = this.dialogueTxt[3];
                this.marianoSay(txt);
            },
            2500,
            function() {
                this.clearDialogue();
            },
            1000,
            function() {
                var txt = this.dialogueTxt[4];
                this.pirateSay(txt);
            },
            2000,
            function() {
                this.clearDialogue();
                this.aznarSprite.play("engarde");
                this.marianoSprite.play("jump");
                this.marianoSprite.animations.currentAnim.onComplete.addOnce(function() {
                    this.marianoSprite.body.velocity.y = 350;
                    var splash = this.add.audio("splash");
                    splash.volume = 1.5;
                    splash.play();
                }, this);
            },
            1500,
            function() {
                this.aznarSprite.play("lose");
            },
            1000,
            function() {
                var txt = this.dialogueTxt[5];
                this.pirateSay(txt);
            },
            3000,
            function() {
                this.clearDialogue();
            },
            1000,
            function() {
                var tween = this.add.tween(this.fade).to({alpha: 1}, 2000);
                tween.onComplete.addOnce(function() {
                    this.state.start("MONCLOA.EndingOcean", true, false);
                }, this);
                tween.start();
                this.bso.fadeTo(2000, 0);
            }
        ];
        if (MONCLOA.DEBUG.on) {
            this.bso.destroy();
            if (MONCLOA.DEBUG.skip_to_ocean) {
                /*queue = queue.splice(17);
                Phaser.Utils.enqueue(queue, this).start();*/
                
                this.state.start("MONCLOA.EndingOcean", true, false);
            }
            if (MONCLOA.DEBUG.skip_to_bottom) {
                this.state.start("MONCLOA.EndingBottom", true, false);
            } else {
                Phaser.Utils.enqueue(queue, this).start();
            }
        } else {
            Phaser.Utils.enqueue(queue, this).start();
        }
    }
};

MONCLOA.EndingOcean = function() {
    
};
MONCLOA.EndingOcean.prototype = {
    init: function() {
        this.MARIANO_FPS = 10;
    },
    create: function() {
        this.bso = this.add.audio("intro_bso");
        this.bso.volume = 0.7;
        this.bso.play();
        
        var bg = this.add.image(this.world.centerX, this.world.centerY, "ocean_bg");
        bg.anchor.setTo(0.5);
        bg.alpha = 0.6;
        
                
        this.fishes2 = this.add.sprite(this.game.width/2, 80, "fishes");
        this.fishes2.angle = 45;
        this.fishes2.scale.setTo(0.4);
        this.game.physics.enable(this.fishes2);
        this.fishes2.body.velocity.x = -20;
        
        this.shark = this.add.sprite(50, 450, "shark");
        this.game.physics.enable(this.shark);
        this.shark.body.velocity.x = 60;
        this.shark.animations.add("swim", [0,1,2,3,4,5,4,3,2,1], 8, true);
        this.shark.play("swim");
        
        this.octopus = this.add.sprite(this.game.width - 180, 350, "octopus");
        this.octopus.scale.setTo(-1, 1);
        this.game.physics.enable(this.octopus);
        this.octopus.body.velocity.x = -20;
        this.octopus.animations.add("swim", [0,1,2,3,3,3,3,3,3,4,5,6,7], 3, true);
        this.octopus.play("swim");
        
        this.marianoSprite = this.add.sprite(this.game.width/2, -100, "rajoy");
        this.marianoSprite.animations.add("sink", [68,75,76,75], 1, true);
        this.marianoSprite.play("sink");
        this.marianoSprite.anchor.setTo(0.5, 1);
        this.game.physics.enable(this.marianoSprite);
        this.marianoSprite.body.velocity.y = 100;
        
        this.barracuda = this.add.sprite(-50, 150, "barracuda");
        this.game.physics.enable(this.barracuda);
        this.barracuda.body.velocity.x = 50;
        this.barracuda.animations.add("swim", [0,1,2,3,4,5,6,7,8,9,10,11], 10, true);
        this.barracuda.play("swim");
        
        this.fishes = this.add.sprite(this.game.width - 100, 580, "fishes");
        this.fishes.angle = 45;
        this.game.physics.enable(this.fishes);
        this.fishes.body.velocity.x = -40;    
        
        this.fade = this.add.image(0, 0, "fade");
        this.fade.alpha = 1;
        var tween = this.add.tween(this.fade).to({alpha: 0}, 1500);
        tween.start();
        
        this.bubbleTimer = this.time.create();
        this.bubbleTimer.repeat(500, 20, this.createBubbles, this);
        this.bubbleTimer.start();
        
        var timer = this.time.create();
        timer.add(10000, function() {
            tween = this.add.tween(this.fade).to({alpha: 1}, 2000);
            tween.onComplete.addOnce(function() {
                this.state.start("MONCLOA.EndingBottom", true, false, this.bso);
            }, this);
            tween.start(); 
        }, this);
        timer.start();
    },
    render: function() {
        if (MONCLOA.DEBUG.on) {
            if (MONCLOA.DEBUG.show_coords) this.game.debug.inputInfo();
        }
    },
    // ---------------------------------------------------------------------------
    createBubbles: function() {
        var pos = {x: this.marianoSprite.position.x + this.rnd.between(-50, 50), y: this.marianoSprite.position.y - 120};
        var bubbles = this.add.sprite(pos.x, pos.y, "bubbles");
        bubbles.anchor.setTo(0.5);
        bubbles.animations.add("idle", [0, 1, 1, 2, 2, 3, 15, 15, 4, 4, 5, 5, 6, 6, 7, 15, 15, 8, 9, 10, 11, 12, 13, 14, 15, 15, 15, 15], 3, true);
        bubbles.play("idle");
        this.game.physics.enable(bubbles);
        bubbles.body.velocity.y = -30;
    }
};

MONCLOA.EndingBottom = function() {
    
};
MONCLOA.EndingBottom.prototype = {
    init: function(bso) {
        this.bso = bso;
        
        this.game_data = this.cache.getJSON("game_data");
        this.dialogueTxt = this.game_data.ending_credits;
        
        this.MARIANO_FPS = 10;
        this.INIT_POS_X = 12;
        this.INIT_POS_Y = 590;
        this.FINAL_POS_Y = 700;
        this.step = (this.FINAL_POS_Y - this.INIT_POS_Y) / 4;
    },
    create: function() {
        var bg = this.add.image(0, 0, "boat_bg");
        var smoke = this.add.sprite(80 + (-this.game.width + bg.width), this.game.height/2 - 20, "smoke");
        smoke.anchor.setTo(0.5, 1);
        smoke.animations.add("idle", [0,1,2,3,4,2], 1, true);
        smoke.play("idle");
        
        this.marianoSprite = this.add.sprite(this.game.width/2 + 200, -100, "rajoy");
        this.marianoSprite.anchor.setTo(0.5, 1);
        this.marianoSprite.scale.setTo(-1, 1);
        this.marianoSprite.animations.add("idle",     [61], 0);
        this.marianoSprite.animations.add("speak_0",    [59,60,59,60,59,60,0,57,58,56,0,57,58,56,0], this.MARIANO_FPS, true);
        this.marianoSprite.animations.add("sink", [68,75,76,75], 1, true);
        this.marianoSprite.play("sink");
        var tweenMariano = this.add.tween(this.marianoSprite.position).to({y:500}, 6000, Phaser.Easing.Exponential.InOut);
        tweenMariano.onComplete.addOnce(this.startDialogue, this);
        tweenMariano.start();
        
        
        this.fade = this.add.image(0, 0, "fade");
        this.fade.alpha = 1;
        var tween = this.add.tween(this.fade).to({alpha: 0}, 1500);
        tween.start();
        
        var scroll = this.add.tween(bg.position).to({x: this.game.width - bg.width}, 2500, Phaser.Easing.Exponential.InOut);
        scroll.start();
        var scroll2 = this.add.tween(smoke.position).to({x: 80}, 2500, Phaser.Easing.Exponential.InOut);
        scroll2.start();
        
        this.canvas = this.add.graphics(0, 0);
        this.canvas.beginFill(0x00FF00, 0.0);
        this.canvas.drawRect(0, 0, this.game.width - this.INIT_POS_X, this.step);
        this.btnTexture = this.canvas.generateTexture();
        this.canvas.destroy();
    },
    render: function() {
        if (MONCLOA.DEBUG.on) {
            if (MONCLOA.DEBUG.show_coords) this.game.debug.inputInfo();
        }
    },
    // ---------------------------------------------------------------------------
    addButtons: function() {
        this.buttons = [];
        for (var q=0; q<4; q++) {
            var btn = this.add.image(this.INIT_POS_X, this.INIT_POS_Y + (q*this.step), this.btnTexture);
            btn.inputEnabled = true;
            btn.name = q;
            btn.events.onInputOver.add(this.onOptionOver, this);
            btn.events.onInputOut.add(this.onOptionOut, this);
            btn.events.onInputUp.add(this.onOptionPress, this);
            this.buttons.push(btn);
        }
    },
    addOptions: function() {
        var options = [
            "Quiero compartir mi logro en Twitter",
            "Quiero compartir mi hazaña en Facebook",
            "Quiero invitar al autor del juego a una cerveza",
            "Quiero jugar otra vez"
        ];
        var pos = 0;
        this.texts = [];
        for (var q=0, l=options.length; q<l; q++) {
            var txt = options[q].txt && options[q].txt.replace(/\n/g, " ") || options[q].replace(/\n/g, " ");
            var btn = this.add.bitmapText(this.INIT_POS_X, this.INIT_POS_Y + (this.step*pos), "white", txt, 20);
            btn.smoothed = false;
            btn.tint = 0x800080;
            btn.name = q;
            btn.originalTxt = options[q].txt || options[q];
            this.texts.push(btn);
            pos++;
        }
    },
    clearDialogue: function() {
        this.marianoSprite.play("idle");
        if (this.dialogue) this.dialogue.destroy();
    },
    createBubbles: function() {
        var pos = {x: this.marianoSprite.position.x + this.rnd.between(-50, 50), y: this.marianoSprite.position.y - 200};
        var bubbles = this.add.sprite(pos.x, pos.y, "bubbles");
        bubbles.anchor.setTo(0.5);
        bubbles.animations.add("idle", [0, 1, 1, 2, 2, 3, 15, 15, 4, 4, 5, 5, 6, 6, 7, 15, 15, 8, 9, 10, 11, 12, 13, 14, 15, 15, 15, 15], 3, true);
        bubbles.play("idle");
        this.game.physics.enable(bubbles);
        bubbles.body.velocity.y = -30;
    },
    marianoSay: function(txt) {
        this.clearDialogue();
        
        this.marianoSprite.play("speak_0");
        this.dialogue = this.add.bitmapText(this.game.width/3, 60, "white", txt, 20);
        this.dialogue.smoothed = false;
        this.dialogue.tint = MONCLOA.COLORS.pp;
        this.dialogue.align = "center";
    },
    narratorSay: function(txt) {
        this.clearDialogue();
        
        this.dialogue = this.add.bitmapText(this.game.width/2, this.game.height*.9, "white", txt, 20);
        this.dialogue.anchor.setTo(0.5);
        this.dialogue.smoothed = false;
        this.dialogue.tint = MONCLOA.COLORS.yellow;
        this.dialogue.align = "center";
    },
    onOptionOver: function(btn, pointer) {
        var txt = this.texts[btn.name];
        if (txt) {
            txt.tint = MONCLOA.COLORS.magenta;   
        }
    },
    onOptionOut: function(btn, pointer) {
        var txt = this.texts[btn.name];
        if (txt) {
            txt.tint = MONCLOA.COLORS.purple;   
        }
    },
    onOptionPress: function(btn, pointer, stillOverObj) {
        if (!stillOverObj) return;
        
        var actions = ["shareTW", "shareFB", "payPal", "replayGame"];
        var index = this.texts[btn.name] && this.texts[btn.name].name;
        if (!isFinite(index)) index = -1;
        var action = actions[btn.name];
        if (action) {
            this[action]();
        }
    },
    payPal: function() {
        window.open("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=3P5RELLNGERCU&lc=ES&item_name=LuisQuin&item_number=MoncloaIslandDonation&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted", "_blank");
    },
    replayGame: function() {
        window.location.reload();
    },
    shareFB: function() {
        window.open('https://www.facebook.com/dialog/share?app_id=240935242613600&display=popup&href=http://www.islamoncloa.com/secreto.html&redirect_uri=http://www.islamoncloa.com/', "_blank");
    },
    shareTW: function() {
        window.open('http://twitter.com/intent/tweet?url=http://www.islamoncloa.com&text=He descubierto el "Secreto de Isla Moncloa". ¡Te reto a conseguirlo!&hashtags=islamoncloa&via=impactophaser', "_blank");
    },
    startDialogue: function() {
        var queue = [
            function() {
                this.marianoSprite.play("idle");
            },
            1500,
            function() {
                var hilillos = this.add.audio("20");
                hilillos.play();
                this.marianoSay("Son unos pequeños hilitos\ncon apariencia de plastilina.");
                var timer = this.time.create();
                timer.repeat(750, 5, this.createBubbles, this);
                timer.start();
            },
            4000,
            function() {
                this.clearDialogue();
                
                this.title = this.add.image(this.world.centerX, this.world.centerY/2, "moncloa_title");
                this.title.anchor.setTo(0.5);
                this.title.alpha = 0;

                var tweenTitle = this.add.tween(this.title).to({alpha:1}, 500, null, true);
                var tweenTitleScale = this.add.tween(this.title.scale).to({x:2.4, y:2.4}, 1000, Phaser.Easing.Exponential.In, true);
                tweenTitle.start();
                tweenTitleScale.start();
            },
            2000,
            this.startEndingCredits
        ];
        Phaser.Utils.enqueue(queue, this).start();
    },
    startEndingCredits: function() {
        var queue  = [];
        for (var q=0, l=this.dialogueTxt.length; q<l; q++) {
            queue.push(
                function() {
                    this.narratorSay(this.dialogueTxt.shift());
                }, 
                3500,
                this.clearDialogue,
                1500
            );
        }
        queue.push(this.addButtons, this.addOptions);
        Phaser.Utils.enqueue(queue, this).start();
    }
};

var game = new Phaser.Game(960, 720, Phaser.CANVAS);

game.state.add("MONCLOA.Boot", MONCLOA.Boot);
game.state.add("MONCLOA.Preload", MONCLOA.Preload);
game.state.add("MONCLOA.Intro", MONCLOA.Intro);
game.state.add("MONCLOA.Menu", MONCLOA.Menu);
game.state.add("MONCLOA.Selection", MONCLOA.Selection);
game.state.add("MONCLOA.Round", MONCLOA.Round);
game.state.add("MONCLOA.Ending", MONCLOA.Ending);
game.state.add("MONCLOA.EndingOcean", MONCLOA.EndingOcean);
game.state.add("MONCLOA.EndingBottom", MONCLOA.EndingBottom);

game.state.start("MONCLOA.Boot");