import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================
// QUESTIONS
// ============================================
var Q = {
easy:[
{cat:"VOCABULARY",q:"What is the opposite of 'happy'?",o:["Sad","Angry","Tired","Hungry"],a:0},
{cat:"VOCABULARY",q:"Which word means 'very big'?",o:["Tiny","Huge","Narrow","Shallow"],a:1},
{cat:"GRAMMAR",q:"Complete: 'She ___ to school every day.'",o:["go","goes","going","gone"],a:1},
{cat:"VOCABULARY",q:"What color do you get mixing blue and yellow?",o:["Purple","Orange","Green","Red"],a:2},
{cat:"GRAMMAR",q:"Which sentence is correct?",o:["I are happy","I is happy","I am happy","I be happy"],a:2},
{cat:"VOCABULARY",q:"A 'dog' is a type of:",o:["Plant","Animal","Food","Vehicle"],a:1},
{cat:"EXPRESSIONS",q:"What does 'Good morning' mean?",o:["Good night","A morning greeting","Goodbye","Thank you"],a:1},
{cat:"VOCABULARY",q:"Which is NOT a fruit?",o:["Apple","Banana","Carrot","Orange"],a:2},
{cat:"GRAMMAR",q:"'They ___ playing football yesterday.'",o:["are","is","was","were"],a:3},
{cat:"VOCABULARY",q:"What is the plural of 'child'?",o:["Childs","Children","Childes","Childrens"],a:1}
],medium:[
{cat:"GRAMMAR",q:"Which uses the present perfect correctly?",o:["I have went to Paris","I have gone to Paris","I has gone to Paris","I have go to Paris"],a:1},
{cat:"VOCABULARY",q:"What does 'procrastinate' mean?",o:["To work hard","To delay doing something","To celebrate","To exercise"],a:1},
{cat:"IDIOMS",q:"What does 'break the ice' mean?",o:["To freeze something","To start a conversation","To break glass","To stop talking"],a:1},
{cat:"GRAMMAR",q:"'If I ___ rich, I would travel.'",o:["am","was","were","be"],a:2},
{cat:"VOCABULARY",q:"Which word is a synonym for 'beautiful'?",o:["Ugly","Gorgeous","Plain","Dull"],a:1},
{cat:"PHRASAL VERBS",q:"'Look up' in a dictionary means to:",o:["Look at the sky","Search for information","Stand up","Wake up"],a:1},
{cat:"GRAMMAR",q:"'There are ___ people here.'",o:["much","many","a lot","few of"],a:1},
{cat:"VOCABULARY",q:"What does 'ambiguous' mean?",o:["Very clear","Open to interpretation","Expensive","Dangerous"],a:1},
{cat:"IDIOMS",q:"'Piece of cake' means something is:",o:["Delicious","Expensive","Very easy","Broken"],a:2},
{cat:"GRAMMAR",q:"Select the passive voice:",o:["The cat caught the mouse","The mouse was caught by the cat","The cat is catching mice","Cats catch mice"],a:1}
],hard:[
{cat:"ADVANCED GRAMMAR",q:"Which uses the subjunctive mood?",o:["I wish I was there","I wish I were there","I wish I am there","I wish I been there"],a:1},
{cat:"VOCABULARY",q:"What does 'ephemeral' mean?",o:["Lasting forever","Short-lived","Very heavy","Extremely loud"],a:1},
{cat:"IDIOMS",q:"'To bite the bullet' means to:",o:["Eat something hard","Endure pain bravely","Shoot a gun","Fail at something"],a:1},
{cat:"GRAMMAR",q:"Identify the correct sentence:",o:["Whom is calling?","Who is calling?","Whose is calling?","Which is calling?"],a:1},
{cat:"VOCABULARY",q:"'Ubiquitous' means:",o:["Extremely rare","Found everywhere","Very unique","Incredibly fast"],a:1},
{cat:"PHRASAL VERBS",q:"'To come across' means to:",o:["Cross the street","Find by chance","Become angry","Approach someone"],a:1},
{cat:"ADVANCED GRAMMAR",q:"Which uses the third conditional?",o:["If I studied, I will pass","If I had studied, I would have passed","If I would study, I had passed","If I study, I would passed"],a:1},
{cat:"VOCABULARY",q:"What does 'serendipity' mean?",o:["A type of dessert","Finding something good by accident","A musical instrument","A formula"],a:1},
{cat:"IDIOMS",q:"'The ball is in your court' means:",o:["You're playing tennis","It's your turn to act","You dropped something","You won the game"],a:1},
{cat:"ADVANCED GRAMMAR",q:"Which is a split infinitive?",o:["To boldly go where no one has gone","To go boldly where no one has gone","Boldly to go where no one has gone","Going boldly"],a:0}
]};

var PHRASES = {
ok:["Brilliant! Correct!","You nailed it!","Absolutely right!","Perfect!","You're on fire!","Excellent!"],
no:["Not quite!","That's not right!","Oh no!","Incorrect!","Not this time!","Wrong!"],
timeout:["Time's up!","Too slow!","Let's move on!"],
suspense:["Hmm, let me check...","Is that the answer? We shall see...","That's locked in. Moment of truth...","Final answer? Let's see...","Tension! Let's reveal...","Let me check carefully..."],
intro:["Welcome to The Donald Goodman Show! The sharpest English speakers go head to head, and the winner walks away with Solana rewards. Are you ready?"]
};

// ============================================
// STATE
// ============================================
var G = {diff:'hard',qi:0,score:0,streak:0,best:0,ok:0,bad:0,sel:-1,busy:false,muted:false,timeLeft:30,maxTime:30,iv:null,sid:0,paused:false,audioCtx:null};
var scene,renderer,clock,mixer,activeCamera;
var glbCams={},btnObjs=[null,null,null,null],animActions=[];
var headLook={on:false,tx:0,ty:0,cx:0,cy:0,base:new THREE.Quaternion(),maxY:1.0,maxP:0.75};
var presenterIdle=null,presenterTalk=null,presenterOk=null,presenterNo=null;
var jawBone=null,presenterRoot=null;
var currentAudio=null,audioAnalyser=null,audioCtxEl=null,speakId=0;
var raycaster=null,pointer=null;
var ELEVEN_KEY='5861bf29e7e266656206e682d02b64e4434d7ed69e1117a176db1469eb612784';
var ELEVEN_VOICE='1wzJ0Fr9SDexsF2IsKU4';
var audioCache={};

function gt(fn,ms){var s=G.sid;return setTimeout(function(){if(G.sid===s)fn()},ms)}

// ============================================
// 3D SCENE
// ============================================
function initScene(){
    var c=document.getElementById('scene3d');
    scene=new THREE.Scene();clock=new THREE.Clock();
    activeCamera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,1000);
    activeCamera.position.set(0,3,10);
    renderer=new THREE.WebGLRenderer({canvas:c,antialias:true,powerPreference:'high-performance'});
    renderer.setSize(innerWidth,innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.0;
    renderer.useLegacyLights=false;
    addEventListener('resize',function(){
        if(activeCamera){activeCamera.aspect=innerWidth/innerHeight;activeCamera.updateProjectionMatrix()}
        renderer.setSize(innerWidth,innerHeight);
    });
    raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();
    animate();loadGLB();
}

function loadGLB(){
    new GLTFLoader().load('https://pub-6b7717a9ca3e47679dd7865d72ce1211.r2.dev/fdasdf/palcoshow9.glb',
    function(gltf){
        scene.add(gltf.scene);
        gltf.scene.traverse(function(o){
            if(o.isLight)o.intensity*=.003;
            if(o.isMesh&&o.material)o.material.envMapIntensity=.5;
        });
        scene.add(new THREE.HemisphereLight(0xffffff,0x222233,.4));
        scene.background=new THREE.Color(0);
        scene.fog=new THREE.Fog(0,18,40);

        // Spotlights on characters
        gltf.scene.updateMatrixWorld(true);
        var seen=new Set(),chars=[];
        gltf.scene.traverse(function(o){
            if(!o.isSkinnedMesh||!o.skeleton||seen.has(o.skeleton.uuid))return;
            seen.add(o.skeleton.uuid);
            var r=o;while(r.parent&&r.parent!==gltf.scene)r=r.parent;
            var b=new THREE.Box3().setFromObject(r),c=new THREE.Vector3(),s=new THREE.Vector3();
            b.getCenter(c);b.getSize(s);chars.push({c:c,h:s.y});
        });
        var sc=new THREE.Vector3();chars.forEach(function(c){sc.add(c.c)});if(chars.length)sc.divideScalar(chars.length);
        chars.forEach(function(c){
            var d=new THREE.Vector3().subVectors(sc,c.c);d.y=0;d.normalize();
            var sp=new THREE.SpotLight(0xffeecc,18,10,Math.PI/5,.6,1.3);
            sp.position.set(c.c.x+d.x*1.5,c.c.y+c.h*1.2,c.c.z+d.z*1.5);
            var t=new THREE.Object3D();t.position.set(c.c.x,c.c.y+c.h*.35,c.c.z);scene.add(t);sp.target=t;scene.add(sp);
        });

        // Cameras
        [{n:'Camera',f:40,p:[-3.59,1.49,4.74],r:[.024,-.319,.01,.947]},
         {n:'Camera.001',f:54.8,p:[-6.62,3.58,8.96],r:[-.075,-.303,-.032,.949]},
         {n:'Camera.002',f:34.2,p:[5.98,3.37,-8.49],r:[-.031,.952,.075,.296]}
        ].forEach(function(d){
            var cam=new THREE.PerspectiveCamera(d.f,innerWidth/innerHeight,.1,1000);
            cam.position.set(d.p[0],d.p[1],d.p[2]);cam.quaternion.set(d.r[0],d.r[1],d.r[2],d.r[3]);
            glbCams[d.n]=cam;
        });

        // Buttons
        gltf.scene.traverse(function(o){
            var m=(o.name||'').match(/^Button_?([1-4])$/i);
            if(m)btnObjs[parseInt(m[1])-1]=o;
        });

        // Animations
        if(gltf.animations.length){
            mixer=new THREE.AnimationMixer(gltf.scene);
            var pc=gltf.animations.find(function(c){return/idle|maya_head|armature/i.test(c.name)})||gltf.animations[0];
            var FPS=24,AU=THREE.AnimationUtils;
            try{
                presenterIdle=mixer.clipAction(AU.subclip(pc,'Idle',108,250,FPS));presenterIdle.loop=THREE.LoopRepeat;presenterIdle.play();
                presenterOk=mixer.clipAction(AU.subclip(pc,'Ok',25,42,FPS));presenterOk.loop=THREE.LoopOnce;presenterOk.clampWhenFinished=true;
                presenterNo=mixer.clipAction(AU.subclip(pc,'No',72,94,FPS));presenterNo.loop=THREE.LoopOnce;presenterNo.clampWhenFinished=true;
                presenterTalk=mixer.clipAction(AU.subclip(pc,'Talk',108,250,FPS));presenterTalk.loop=THREE.LoopRepeat;
            }catch(e){console.warn('Anim subclip err:',e)}
            gltf.animations.forEach(function(c){if(c!==pc){var a=mixer.clipAction(c);a.loop=THREE.LoopRepeat;a.play();a.time=0;a.paused=true;animActions.push(a)}});
            mixer.addEventListener('finished',function(e){
                if(e.action===presenterOk||e.action===presenterNo){e.action.fadeOut(.3);presenterIdle.reset().fadeIn(.3).play()}
            });
        }

        // Jaw bone
        gltf.scene.traverse(function(o){if(!jawBone&&o.isBone&&/jaw/i.test(o.name))jawBone=o});

        // Hide presenter on start screen
        var closest=null,cd=Infinity;
        gltf.scene.traverse(function(o){if(!o.isSkinnedMesh)return;var r=o;while(r.parent&&r.parent!==gltf.scene)r=r.parent;var w=new THREE.Vector3();r.getWorldPosition(w);var d=w.distanceTo(sc);if(d<cd){cd=d;closest=r}});
        if(closest){presenterRoot=closest;presenterRoot.visible=false}

        switchCam('Camera.002');
        el('loadBar').style.width='100%';el('loadPct').textContent='100%';
        el('loadStatus').textContent='Ready! Enter your name to play';
        el('startBtn').classList.add('ready');el('playText').textContent='Play Now';
    },
    function(xhr){
        var t=xhr.total>0?xhr.total:113000000;var p=Math.min(99,Math.round(xhr.loaded/t*100));
        el('loadBar').style.width=p+'%';el('loadPct').textContent=p+'%';
    },
    function(e){console.error('GLB err:',e);el('loadStatus').textContent='Error loading scene'}
    );
}

function switchCam(n){var c=glbCams[n];if(!c)return;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();activeCamera=c;
    if(n==='Camera'){headLook.base.copy(c.quaternion);headLook.tx=0;headLook.ty=0;headLook.cx=0;headLook.cy=0}
}

function animate(){
    requestAnimationFrame(animate);var d=clock.getDelta();
    if(mixer)mixer.update(d);
    // Head look
    if(headLook.on&&activeCamera){
        headLook.cx+=(headLook.tx-headLook.cx)*.08;headLook.cy+=(headLook.ty-headLook.cy)*.08;
        var yq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),headLook.cx);
        var pq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),headLook.cy);
        activeCamera.quaternion.copy(headLook.base).multiply(yq).multiply(pq);
    }
    // Crosshair
    var ch=el('gCross');if(ch&&ch.classList.contains('on')){
        pointer.set(0,0);raycaster.setFromCamera(pointer,activeCamera);
        var hit=-1;for(var i=0;i<4;i++){if(btnObjs[i]&&raycaster.intersectObject(btnObjs[i],true).length>0){hit=i;break}}
        ch.classList.toggle('hit',hit>=0);ch.classList.remove('c0','c1','c2','c3');
        if(hit>=0)ch.classList.add('c'+hit);
    }
    // Lip sync
    if(audioAnalyser){var dd=new Uint8Array(audioAnalyser.frequencyBinCount);audioAnalyser.getByteFrequencyData(dd);var sum=0;for(var j=0;j<32;j++)sum+=dd[j];var avg=sum/32/255;var mv=Math.min(1,avg*2.5);if(jawBone)jawBone.rotation.x+=(mv*.35-jawBone.rotation.x)*.5}
    if(activeCamera&&renderer)renderer.render(scene,activeCamera);
}

// ============================================
// UI HELPERS
// ============================================
function el(id){return document.getElementById(id)}
function show(id){var e=el(id);e.classList.remove('fade-out');e.classList.add('active')}
function hide(id){var e=el(id);e.classList.add('fade-out');setTimeout(function(){e.classList.remove('active','fade-out')},500)}
function showHUD(){['gTop','gQuestion','gOpts'].forEach(function(id){var e=el(id);if(e){e.style.opacity='1';e.style.pointerEvents='auto'}})}
function hideHUD(){['gTop','gQuestion','gOpts'].forEach(function(id){var e=el(id);if(e){e.style.opacity='0';e.style.pointerEvents='none'}})}

function speak(text,dur){
    var b=el('gBubble'),bt=el('gBubbleText');if(bt)bt.textContent=text;if(b)b.classList.add('vis');
    speakId++;var myId=speakId;
    audioAnalyser=null;
    var d=dur||Math.max(2000,text.length*60);
    setTimeout(function(){if(b)b.classList.remove('vis')},d+1000);
    if(G.muted)return;
    // ElevenLabs
    var cached=audioCache[text];
    if(cached){playBlob(cached,myId);return}
    fetch('https://api.elevenlabs.io/v1/text-to-speech/'+ELEVEN_VOICE,{method:'POST',headers:{'xi-api-key':ELEVEN_KEY,'Content-Type':'application/json',Accept:'audio/mpeg'},body:JSON.stringify({text:text,model_id:'eleven_turbo_v2_5',voice_settings:{stability:.5,similarity_boost:.75,style:.3}})})
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.blob()})
    .then(function(bl){audioCache[text]=bl;if(myId===speakId)playBlob(bl,myId)})
    .catch(function(e){console.warn('EL fail:',e);if(myId!==speakId)return;if('speechSynthesis' in window){var u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.95;speechSynthesis.speak(u)}});
}
function playBlob(blob,id){
    if(id!==speakId)return;if(currentAudio){try{currentAudio.pause();currentAudio.src=''}catch(e){}currentAudio=null}
    var url=URL.createObjectURL(blob),a=new Audio(url);currentAudio=a;
    if(!audioCtxEl)audioCtxEl=new(window.AudioContext||window.webkitAudioContext)();
    try{var src=audioCtxEl.createMediaElementSource(a);audioAnalyser=audioCtxEl.createAnalyser();audioAnalyser.fftSize=256;src.connect(audioAnalyser);audioAnalyser.connect(audioCtxEl.destination)}catch(e){}
    if(presenterTalk&&presenterIdle){presenterIdle.fadeOut(.2);presenterTalk.reset().fadeIn(.2).play()}
    a.onended=function(){URL.revokeObjectURL(url);if(currentAudio===a)currentAudio=null;audioAnalyser=null;if(jawBone)jawBone.rotation.x=0;if(presenterTalk&&presenterIdle){presenterTalk.fadeOut(.3);presenterIdle.reset().fadeIn(.3).play()}};
    a.play().catch(function(){});
}
function sfx(t){
    if(G.muted)return;try{
    if(!G.audioCtx)G.audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    var c=G.audioCtx,o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);
    if(t==='ok'){o.type='sine';o.frequency.setValueAtTime(523,c.currentTime);o.frequency.setValueAtTime(659,c.currentTime+.1);o.frequency.setValueAtTime(784,c.currentTime+.2);g.gain.setValueAtTime(.2,c.currentTime);g.gain.exponentialRampToValueAtTime(.01,c.currentTime+.4);o.start();o.stop(c.currentTime+.4)}
    else if(t==='no'){o.type='sawtooth';o.frequency.setValueAtTime(200,c.currentTime);o.frequency.setValueAtTime(150,c.currentTime+.2);g.gain.setValueAtTime(.15,c.currentTime);g.gain.exponentialRampToValueAtTime(.01,c.currentTime+.4);o.start();o.stop(c.currentTime+.4)}
    else if(t==='tick'){o.type='sine';o.frequency.setValueAtTime(880,c.currentTime);g.gain.setValueAtTime(.05,c.currentTime);g.gain.exponentialRampToValueAtTime(.01,c.currentTime+.05);o.start();o.stop(c.currentTime+.05)}
    }catch(e){}
}

// ============================================
// TIMER
// ============================================
function startTimer(){
    G.timeLeft=G.maxTime;updTimer();
    el('gBigTimer').classList.add('on');
    animActions.forEach(function(a){a.paused=false});
    clearInterval(G.iv);
    G.iv=setInterval(function(){G.timeLeft--;updTimer();if(G.timeLeft<=5)sfx('tick');if(G.timeLeft<=0){clearInterval(G.iv);onTimeout()}},1000);
}
function stopTimer(){
    clearInterval(G.iv);el('gBigTimer').classList.remove('on');
    animActions.forEach(function(a){a.time=0;a.paused=true});
}
function updTimer(){
    var t=el('gTimerNum'),r=el('gTimerRing'),b=el('gBigNum');
    if(t)t.textContent=G.timeLeft;if(b)b.textContent=G.timeLeft;
    if(r)r.style.strokeDashoffset=106.8*(1-G.timeLeft/G.maxTime);
    var w=G.timeLeft<=8;
    if(t)t.classList.toggle('warn',w);if(r)r.classList.toggle('warn',w);if(b)b.classList.toggle('warn',w);
}

// ============================================
// GAME FLOW
// ============================================
function shuffle(a){var r=a.slice();for(var i=r.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=r[i];r[i]=r[j];r[j]=t}return r}

function startGame(){
    G.sid++;G.questions=shuffle(Q[G.diff]).slice(0,10);G.qi=0;G.score=0;G.streak=0;G.best=0;G.ok=0;G.bad=0;G.busy=false;G.sel=-1;
    el('gScore').textContent='0';el('gStreak').textContent='0';el('gLevel').textContent=G.diff.toUpperCase();
    // Build dots
    var dots=el('gDots');dots.innerHTML='';for(var i=0;i<10;i++){var d=document.createElement('div');d.className='g-dot';dots.appendChild(d)}
    hide('startScreen');
    if(presenterRoot)presenterRoot.visible=true;
    switchCam('Camera');
    // Crosshair + pointer lock
    document.body.classList.add('game-active');
    el('gCross').classList.add('on');
    var cv=el('scene3d');try{cv.requestPointerLock()}catch(e){}
    headLook.on=true;
    setTimeout(function(){
        show('gameScreen');hideHUD();
        headLook.on=true;
        var intro=PHRASES.intro[Math.floor(Math.random()*PHRASES.intro.length)];
        speak(intro);
        var dur=Math.max(6000,Math.min(12000,intro.length*55));
        gt(function(){showHUD();showQ()},dur+500);
    },800);
}

function showQ(){
    if(G.qi>=G.questions.length){endGame();return}
    G.sel=-1;G.busy=false;
    var q=G.questions[G.qi];
    // Keep camera where it is (no reset between questions)
    headLook.on=true;
    // Update UI
    el('gCat').textContent=q.cat;el('gNum').textContent=(G.qi+1)+'/10';el('gText').textContent=q.q;
    el('gDots').children[G.qi].classList.add('now');
    document.querySelectorAll('.g-opt').forEach(function(o,i){o.querySelector('.go-txt').textContent=q.o[i];o.className='g-opt';o.disabled=false;o.style.animation='none';o.offsetHeight;o.style.animation=''});
    showHUD();
    speak(q.q);
    var rd=Math.min(6000,Math.max(2500,q.q.length*55));
    gt(function(){G.busy=false;startTimer()},rd+300);
}

function aimButtons(){
    var avg=new THREE.Vector3(),n=0;
    for(var i=0;i<4;i++){if(!btnObjs[i])continue;var w=new THREE.Vector3();btnObjs[i].getWorldPosition(w);avg.add(w);n++}
    if(!n||!activeCamera)return;avg.divideScalar(n);
    var cp=new THREE.Vector3();activeCamera.getWorldPosition(cp);
    var m=new THREE.Matrix4().lookAt(cp,avg,new THREE.Vector3(0,1,0));
    headLook.base.setFromRotationMatrix(m);headLook.tx=0;headLook.ty=0;headLook.cx=0;headLook.cy=0;
    activeCamera.quaternion.copy(headLook.base);
}

function selectOpt(i){
    if(G.busy)return;G.sel=i;
    document.querySelectorAll('.g-opt').forEach(function(o,j){o.className='g-opt'+(j===i?' sel':'')});
    // Pulse 3D button
    pulseDome(i);
    // Confirm after short delay
    G.busy=true;
    gt(function(){confirmAnswer()},400);
}

function pulseDome(i){
    var btn=btnObjs[i];if(!btn)return;
    var cols=[0x22c55e,0x3b82f6,0xeab308,0xef4444],col=new THREE.Color(cols[i]);
    var meshes=[];btn.traverse(function(o){if(o.isMesh&&/head/i.test(o.name||''))meshes.push(o)});
    if(!meshes.length)btn.traverse(function(o){if(o.isMesh)meshes.push(o)});
    meshes.forEach(function(m){if(!m.material)return;m.material=m.material.clone();if(m.material.emissive){m.material.emissive.copy(col);m.material.emissiveIntensity=2.5}});
    var st=performance.now();(function fade(){var t=Math.min(1,(performance.now()-st)/700);
        meshes.forEach(function(m){if(m.material&&m.material.emissive)m.material.emissiveIntensity=2.5*(1-t)});
        if(t<1)requestAnimationFrame(fade);
    })();
}

function confirmAnswer(){
    stopTimer();
    var sus=PHRASES.suspense[Math.floor(Math.random()*PHRASES.suspense.length)];
    speak(sus);
    gt(function(){revealAnswer()},Math.min(4000,Math.max(2200,sus.length*55)));
}

function revealAnswer(){
    var q=G.questions[G.qi],opts=document.querySelectorAll('.g-opt');
    opts.forEach(function(o,i){o.disabled=true;o.className='g-opt'+(i===q.a?' ok':(i===G.sel&&i!==q.a?' bad':''))});
    var dot=el('gDots').children[G.qi];if(dot)dot.classList.remove('now');
    if(G.sel===q.a){
        var pts=100+Math.floor(G.timeLeft*2)+Math.min(G.streak*10,100);
        G.score+=pts;G.streak++;G.ok++;if(G.streak>G.best)G.best=G.streak;
        sfx('ok');if(presenterOk&&presenterIdle){presenterIdle.fadeOut(.2);presenterOk.reset().fadeIn(.2).play()}
        speak(PHRASES.ok[Math.floor(Math.random()*PHRASES.ok.length)]);
        if(dot)dot.classList.add('ok');
    }else{
        G.streak=0;G.bad++;sfx('no');
        if(presenterNo&&presenterIdle){presenterIdle.fadeOut(.2);presenterNo.reset().fadeIn(.2).play()}
        speak(PHRASES.no[Math.floor(Math.random()*PHRASES.no.length)]);
        if(dot)dot.classList.add('bad');
    }
    el('gScore').textContent=G.score;el('gStreak').textContent=G.streak;
    gt(function(){G.qi++;showQ()},2500);
}

function onTimeout(){
    if(G.busy)return;G.busy=true;
    var q=G.questions[G.qi],opts=document.querySelectorAll('.g-opt');
    opts.forEach(function(o,i){o.disabled=true;o.className='g-opt'+(i===q.a?' ok':'')});
    G.streak=0;G.bad++;el('gStreak').textContent='0';
    speak(PHRASES.timeout[Math.floor(Math.random()*PHRASES.timeout.length)]);
    var dot=el('gDots').children[G.qi];if(dot){dot.classList.remove('now');dot.classList.add('bad')}
    gt(function(){G.qi++;showQ()},2500);
}

function endGame(){
    stopTimer();exitGame();hide('gameScreen');
    // Save score
    var pn=el('nameInput');var nm=pn&&pn.value?pn.value.trim():'Player';
    var prof=loadProfile();var wallet=prof.wallet||'---';
    var entry={name:nm,pts:G.score,w:wallet,date:new Date().toISOString().split('T')[0]};
    // Local
    var ranks=JSON.parse(localStorage.getItem('dg_ranks')||'[]');
    ranks.push(entry);ranks.sort(function(a,b){return b.pts-a.pts});
    localStorage.setItem('dg_ranks',JSON.stringify(ranks.slice(0,10)));
    // Firestore
    if(window.db){
        var id=nm.toLowerCase().replace(/\s/g,'_')+'_'+Date.now();
        window.db.collection('leaderboard').doc(id).set(entry).then(function(){console.log('Score saved to Firestore')}).catch(function(e){console.warn('Firestore save fail:',e)});
    }
    renderRanking();
    speak("What a show! Let's see your results!");
    switchCam('Camera.001');
    gt(function(){
        el('rScore').textContent=G.score;el('rCorrect').textContent=G.ok;el('rWrong').textContent=G.bad;el('rStreak').textContent=G.best;
        var p=G.ok/10,g=p>=.9?'A+':p>=.8?'A':p>=.7?'B':p>=.6?'C':p>=.5?'D':'F';
        var ge=el('rGrade');ge.textContent=g;
        ge.style.color=p>=.7?'#4ade80':p>=.5?'#eab308':'#ef4444';
        ge.style.borderColor=ge.style.color;
        show('resultsScreen');
    },3000);
}

function exitGame(){
    document.body.classList.remove('game-active');
    el('gCross').classList.remove('on','hit','c0','c1','c2','c3');
    headLook.on=false;headLook.tx=0;headLook.ty=0;
    if(document.pointerLockElement)document.exitPointerLock();
}

function killAll(){
    G.sid++;clearInterval(G.iv);speakId++;
    if(currentAudio){try{currentAudio.pause();currentAudio.src=''}catch(e){}currentAudio=null}
    audioAnalyser=null;if('speechSynthesis' in window)speechSynthesis.cancel();
    if(G.audioCtx&&G.audioCtx.state!=='closed')try{G.audioCtx.suspend()}catch(e){}
    if(mixer)mixer.timeScale=1;
}

// ============================================
// PAUSE
// ============================================
function openPause(){
    el('pauseMenu').classList.add('vis');G.paused=true;G.pausedTime=G.timeLeft;clearInterval(G.iv);
    headLook.on=false;document.body.classList.remove('game-active');
    if(document.pointerLockElement)try{document.exitPointerLock()}catch(e){}
    if(currentAudio)try{currentAudio.pause()}catch(e){};if('speechSynthesis' in window)speechSynthesis.pause();
    if(mixer)mixer.timeScale=0;
}
function closePause(){
    el('pauseMenu').classList.remove('vis');G.paused=false;
    document.body.classList.add('game-active');headLook.on=true;
    headLook.tx=0;headLook.ty=0;headLook.cx=0;headLook.cy=0;
    if(activeCamera)headLook.base.copy(activeCamera.quaternion);
    try{el('scene3d').requestPointerLock()}catch(e){}
    if(currentAudio)try{currentAudio.play()}catch(e){};if('speechSynthesis' in window)speechSynthesis.resume();
    if(mixer)mixer.timeScale=1;
    if(G.pausedTime>0&&el('gBigTimer').classList.contains('on')){
        G.timeLeft=G.pausedTime;
        G.iv=setInterval(function(){G.timeLeft--;updTimer();if(G.timeLeft<=5)sfx('tick');if(G.timeLeft<=0){clearInterval(G.iv);onTimeout()}},1000);
    }
}
function quitGame(){
    el('pauseMenu').classList.remove('vis');killAll();exitGame();
    if(presenterRoot)presenterRoot.visible=false;
    hide('gameScreen');hide('resultsScreen');switchCam('Camera.002');
    setTimeout(function(){show('startScreen');if(G.audioCtx)try{G.audioCtx.resume()}catch(e){}},600);
}

// ============================================
// RELIEF LOGO
// ============================================
function initRelief(){
    function hex2rgb(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)}}
    function dk(c,f){return'rgb('+Math.round(c.r*f)+','+Math.round(c.g*f)+','+Math.round(c.b*f)+')'}
    function relief(hex,depth){
        var c=hex2rgb(hex),l='rgba('+(Math.min(255,c.r+120))+','+(Math.min(255,c.g+120))+','+(Math.min(255,c.b+120))+',.9)';
        var s='0 -3px 0 '+l+',';for(var i=1;i<=depth;i++){s+=i+'px '+i+'px 0 '+dk(c,Math.max(0,1-i/depth*.85));if(i<depth)s+=','};
        s+=','+(depth+1)+'px '+(depth+3)+'px '+(depth+4)+'px rgba(0,0,0,.75)';return s;
    }
    var r1=el('rl1r'),r2=el('rl2r');
    if(r1)r1.style.textShadow=relief('#22c55e',6);
    if(r2)r2.style.textShadow=relief('#ffffff',6);
}

// ============================================
// INIT
// ============================================
window.renderRanking=renderRanking;
function renderRanking(){
    var body=el('rankBody');if(!body)return;

    // Try Firestore first
    if(window.db){
        window.db.collection('leaderboard').orderBy('pts','desc').limit(10).get().then(function(snap){
            var rows=[];
            snap.forEach(function(doc){rows.push(doc.data())});
            renderRows(body,rows);
        }).catch(function(e){console.warn('Firestore read fail:',e);renderLocal(body)});
    }else{
        renderLocal(body);
    }
}
function renderLocal(body){
    renderRows(body,[]);
}
function renderRows(body,rows){
    var html='';
    for(var i=0;i<10;i++){
        var r=rows[i];
        if(r){
            var pts=(r.pts||0).toLocaleString('en-US');
            var w=r.w||'---';if(w.length>12)w=w.substr(0,6)+'...'+w.substr(-4);
            html+='<div class="rank-row"><span class="rt-pos">'+(i+1)+'</span><span class="rt-name">'+(r.name||'Anonymous')+'</span><span class="rt-pts">'+pts+' pts</span><span class="rt-wallet">'+w+'</span></div>';
        }else{
            html+='<div class="rank-row" style="opacity:.3"><span class="rt-pos">'+(i+1)+'</span><span class="rt-name" style="font-style:italic;color:rgba(255,255,255,.25)">Waiting for player...</span><span class="rt-pts" style="color:rgba(255,255,255,.15)">---</span><span class="rt-wallet">---</span></div>';
        }
    }
    body.innerHTML=html;
}

// ============================================
// PROFILE
// ============================================
function loadProfile(){
    try{return JSON.parse(localStorage.getItem('dg_prof')||'{}')}catch(e){return{}}
}
function saveProf(){
    var name=el('profNameInput').value.trim();
    var wallet=el('profWallet').value.trim();
    if(!name){el('profNameInput').focus();return}
    var p=loadProfile();p.name=name;p.wallet=wallet;
    localStorage.setItem('dg_prof',JSON.stringify(p));
    updateProfUI(p);
    el('profModal').classList.remove('vis');
    // Auto-fill start form
    el('nameInput').value=name;
}
function updateProfUI(p){
    var init=p.name?p.name[0].toUpperCase():'?';
    el('profInitial').textContent=init;el('profBigInitial').textContent=init;
    el('profName').textContent=p.name||'Set profile';
    el('profNameInput').value=p.name||'';
    el('profWallet').value=p.wallet||'';
    if(p.photo){
        el('profAvatar').innerHTML='<img src="'+p.photo+'">';
        el('profBigAvatar').innerHTML='<img src="'+p.photo+'">';
    }
}
function initProfile(){
    var p=loadProfile();updateProfUI(p);
    if(p.name)el('nameInput').value=p.name;
    // File upload
    el('profFile').addEventListener('change',function(e){
        var f=e.target.files[0];if(!f)return;
        var r=new FileReader();r.onload=function(ev){
            var img=new Image();img.onload=function(){
                var c=document.createElement('canvas');c.width=128;c.height=128;
                var ctx=c.getContext('2d');var m=Math.min(img.width,img.height);
                ctx.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,128,128);
                var url=c.toDataURL('image/jpeg',.7);
                var p=loadProfile();p.photo=url;localStorage.setItem('dg_prof',JSON.stringify(p));
                el('profAvatar').innerHTML='<img src="'+url+'">';
                el('profBigAvatar').innerHTML='<img src="'+url+'">';
            };img.src=ev.target.result;
        };r.readAsDataURL(f);
    });
    el('profSave').addEventListener('click',saveProf);
}

function init(){
    initScene();initRelief();renderRanking();initProfile();
    if('speechSynthesis' in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=function(){speechSynthesis.getVoices()}}

    // Difficulty
    document.querySelectorAll('.sf-btn').forEach(function(b){b.addEventListener('click',function(){
        document.querySelectorAll('.sf-btn').forEach(function(x){x.classList.remove('sel')});
        b.classList.add('sel');G.diff=b.dataset.level;
    })});

    // Start
    var lastQuit=0;
    el('startBtn').addEventListener('click',function(){
        if(!this.classList.contains('ready')||Date.now()-lastQuit<1000)return;
        var name=el('nameInput').value.trim();
        if(!name){el('nameInput').focus();return}
        startGame();
    });
    el('nameInput').addEventListener('keydown',function(e){if(e.key==='Enter')el('startBtn').click()});

    // Options click (via crosshair)
    addEventListener('click',function(){
        if(!el('gCross').classList.contains('on')||G.busy)return;
        pointer.set(0,0);raycaster.setFromCamera(pointer,activeCamera);
        for(var i=0;i<4;i++){if(btnObjs[i]&&raycaster.intersectObject(btnObjs[i],true).length>0){selectOpt(i);return}}
    });

    // Mouse head look
    addEventListener('mousemove',function(e){
        if(!headLook.on)return;
        if(document.pointerLockElement){
            headLook.tx=Math.max(-headLook.maxY,Math.min(headLook.maxY,headLook.tx-e.movementX*.0025));
            headLook.ty=Math.max(-headLook.maxP,Math.min(headLook.maxP,headLook.ty-e.movementY*.0025));
        }
    });

    // ESC
    document.addEventListener('pointerlockchange',function(){
        if(!document.pointerLockElement&&document.body.classList.contains('game-active')&&!G.paused)openPause();
    });
    document.addEventListener('keydown',function(e){
        if(e.key!=='Escape')return;
        if(el('pauseMenu').classList.contains('vis'))closePause();
        else if(document.body.classList.contains('game-active'))openPause();
    });

    // Pause buttons
    el('pResume').addEventListener('click',closePause);
    el('pRestart').addEventListener('click',function(){el('pauseMenu').classList.remove('vis');killAll();exitGame();hide('gameScreen');setTimeout(startGame,300)});
    el('pMute').addEventListener('click',function(){G.muted=!G.muted;this.textContent=G.muted?'UNMUTE':'MUTE';if(G.muted&&currentAudio)try{currentAudio.pause()}catch(e){}});
    el('pQuit').addEventListener('click',function(){lastQuit=Date.now();quitGame()});

    // Play again
    el('rAgain').addEventListener('click',function(){
        hide('resultsScreen');if(presenterRoot)presenterRoot.visible=false;
        switchCam('Camera.002');setTimeout(function(){show('startScreen')},600);
    });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
