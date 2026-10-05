/* I WANNA BE YOURS — five-day love puzzle. Everything is stored locally in this browser. */
(() => {
  'use strict';
  const KEY='iwby_love_journey_v1';
  const PHOTO='assets/love-photo.png';
  const VIDEO_ID='15NRKuBlotHagNvt7F_-Y6IX6bKtJsg4z';

  
  const $=id=>document.getElementById(id);
  const dayTitles=['The Tiny Brain Spark','Hidden Leaf, Hidden Heart','The Constellation of Us','Crack the Love Code','Your Birthday, My Favourite Day'];
  const dayDescriptions=[
    'Three playful mini-games. Warm up your brain, collect clues, and prove that cute can be clever.',
    'A Naruto-inspired memory mission: remember the symbols, then rebuild the seal in the right order.',
    'A tricky little maze for a heart that always finds its way back to you.',
    'Decode the secret love note with logic, pattern spotting, and a little patience.',
    'Today is yours. Break the heart, reveal our photo, and open your birthday surprise.'
  ];
  const gameNames=['Memory Spark','Naruto Love Seal','Find Your Way to Me','The Secret Love Cipher'];
  let state, currentDay=1, activeGame=0, startedAt=Date.now(), timerHandle=null, audioCtx=null, musicTimer=null, musicOn=true, toastTimer=null;
  let game={};
  function localDateKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function atDate(d,h=0,m=0,s=0){const x=new Date(d);x.setHours(h,m,s,0);return x}
  function getFreshState(){const now=new Date();return {register:'LOVE-'+Math.random().toString(36).slice(2,6).toUpperCase()+'-'+String(Math.floor(100+Math.random()*900)),firstOpened:now.toISOString(),startDate:localDateKey(now),completed:[false,false,false,false,false],revealed:[false,false,false,false],birthdayHits:0,birthdayDone:false,playedSeconds:[0,0,0,0,0],gameWins:[0,0,0,0,0],musicOn:true}}
  function loadState(){try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(s&&s.register&&s.firstOpened)return {...getFreshState(),...s}}}catch(e){}const s=getFreshState();saveState(s);return s}
  function saveState(s=state){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){toast('Browser storage is unavailable; your progress may not persist.')}}
  function dateForOffset(n){const d=new Date(`${state.startDate}T12:00:00`);d.setDate(d.getDate()+n);return d}
  function schedule(){const start=new Date(state.firstOpened);const startDate=new Date(`${state.startDate}T12:00:00`);const d2=atDate(dateForOffset(1),4);const d3=atDate(dateForOffset(2),4);const d4=atDate(dateForOffset(3),4);const d5=atDate(dateForOffset(4),0);const d2end=atDate(dateForOffset(2),4);const d3end=atDate(dateForOffset(3),4);const d4end=atDate(dateForOffset(4),0);return [{start,end:d2},{start:d2,end:d2end},{start:d3,end:d3end},{start:d4,end:d4end},{start:d5,end:atDate(dateForOffset(5),0)}]}
  function determineDay(){const now=new Date(), sch=schedule();if(now<sch[0].start)return 1;for(let i=0;i<5;i++){if(now>=sch[i].start&&now<sch[i].end)return i+1}if(now>=sch[4].end)return 5;return 1}
  function formatDate(d){return d.toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
  function fmtSecs(n){n=Math.max(0,Math.floor(n));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
  function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
  function setFeedback(msg){$('gameFeedback').textContent=msg}
  function show(id,yes){$(id).classList.toggle('hidden',!yes)}
  function init(){state=loadState();musicOn=state.musicOn!==false;$('registerBadge').textContent='LOVE ID: '+state.register;$('soundLabel').textContent=musicOn?'Music on':'Music off';const sch=schedule();currentDay=determineDay();document.body.dataset.day=currentDay;renderJourney();renderPhotoGrid();renderPage();startClock();startMusic();$('soundBtn').addEventListener('click',toggleMusic);$('newGameBtn').addEventListener('click',newGame);$('hintBtn').addEventListener('click',hint);$('showAllBtn').addEventListener('click',()=>{state.revealed=[true,true,true,true];saveState();renderPhotoGrid();toast('A preview of all four pieces 🧡')});$('backToGameBtn').addEventListener('click',()=>{show('gamePanel',true);$('gamePanel').scrollIntoView({behavior:'smooth',block:'start'});newGame()});$('shootBtn').addEventListener('click',shootArrow);$('dontClickBtn').addEventListener('click',openVideo);$('closeVideo').addEventListener('click',closeVideo);$('videoDialog').addEventListener('click',e=>{if(e.target===$('videoDialog'))closeVideo()});window.addEventListener('storage',e=>{if(e.key===KEY){state=loadState();renderJourney();renderPage()}});}
  function renderPage(){const sch=schedule(),now=new Date();currentDay=determineDay();for(let i=0;i<4;i++){if(now>=sch[i].end)state.completed[i]=true}if(currentDay===5)state.completed=[true,true,true,true,true];saveState();document.body.dataset.day=currentDay;const idx=currentDay-1;$('dayName').textContent=`Day ${currentDay} of 5`;const dayStart=sch[idx].start;$('dayDate').textContent=currentDay===1?`Started ${formatDate(new Date(state.firstOpened))}`:`Opens ${formatDate(dayStart)}`;$('progressFill').style.width=(state.completed.filter(Boolean).length/5*100)+'%';$('streakLine').textContent=`${'🧡 '.repeat(state.completed.filter(Boolean).length)}${state.completed.filter(Boolean).length} / 5 days collected`;$('heroTitle').innerHTML=currentDay===5?'Happy birthday,<br><em>my favourite.</em>':currentDay===1?'Five days.<br><em>One forever.</em>':`Day ${currentDay}.<br><em>Closer to us.</em>`;$('heroSubtitle').textContent=currentDay===5?'Today, the whole little universe is celebrating you.':'Every puzzle brings you closer to a little piece of us.';
    const active=now>=sch[idx].start&&now<sch[idx].end;show('notReady',!active);show('gamePanel',active&&currentDay<5);show('birthdayPanel',currentDay===5);show('revealPanel',currentDay>=2&&currentDay<=4);if(!active&&currentDay<5){$('notReadyText').textContent=`Your next chapter opens ${formatDate(sch[idx].start)}. Until then, your orange-heart collection is safe.`}if(currentDay<5){$('gameKicker').textContent=['DAY ONE • THREE MINI-GAMES','DAY TWO • HIDDEN LEAF MISSION','DAY THREE • VERY TRICKY MAZE','DAY FOUR • LOVE CODE'][idx];$('gameTitle').textContent=dayTitles[idx];$('gameDescription').textContent=dayDescriptions[idx];$('difficulty').textContent=['EASY + PLAYFUL','HARD • MEMORY','VERY HARD • MAZE','DIFFICULT • CIPHER'][idx];$('revealTitle').textContent=['','Your first hidden piece: I','The next piece spells LOVE','The third piece says YOU'][idx];$('revealCopy').textContent=state.revealed[idx-1]?'You earned this piece by solving today’s adventure. 🧡':'Finish today’s game to reveal this piece of our picture.';if(active&&activeGame===0&&!game.initialized)startGameForDay(currentDay);renderPhotoGrid()}else{renderBirthday()}}
  function renderJourney(){const sch=schedule(),now=new Date(),list=$('journeyList');list.innerHTML='';for(let i=0;i<5;i++){const day=i+1, passed=now>=sch[i].end, earned=state.completed[i]||passed;const div=document.createElement('div');div.className='journey-item';const label=day===5?'Birthday surprise':day===1?'Three mini-games':day===2?'Naruto-inspired memory seal':day===3?'Heart-finding maze':'Secret love cipher';const status=state.completed[i]?'🧡 Collected':passed?'🧡 Day complete':now>=sch[i].start?'♡ In progress':'🔒 Waiting';div.innerHTML=`<span class="journey-emoji">${earned?'🧡':['✨','🍥','🧩','🔐','🎂'][i]}</span><div><strong>Day ${day} · ${label}</strong><small>${formatDate(sch[i].start)}</small></div><span class="journey-status">${status}</span>`;list.appendChild(div)}}
  function renderPhotoGrid() {
  const grid = $('photoGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const labels = ['I', 'LOVE', 'YOU', '🧡'];

  // Day 1 = 0 pieces
  // Day 2 = 1 piece
  // Day 3 = 2 pieces
  // Day 4 = 3 pieces
  // Day 5 = 4 pieces
  const piecesToReveal = Math.max(0, Math.min(4, currentDay - 1));

  for (let i = 0; i < 4; i++) {

    const p = document.createElement('div');
    p.className = 'photo-part';

    // Reveal the correct piece according to the day
    if (i < piecesToReveal) {
      p.classList.add('revealed');
    }

    const im = document.createElement('img');

    im.src = PHOTO;
    im.alt = 'Our photo';
    im.className = 'photo-piece-image';

    p.appendChild(im);

    // Cover for unrevealed pieces
    if (i >= piecesToReveal) {
      const cover = document.createElement('div');
      cover.className = 'piece-cover';

      const word = document.createElement('span');
      word.className = 'overlay-word';
      word.textContent = labels[i];

      cover.appendChild(word);
      p.appendChild(cover);
    }

    im.onerror = () => {
      const help = $('photoHelp');
      if (help) {
        help.classList.remove('hidden');
      }
    };

    im.onload = () => {
      const help = $('photoHelp');
      if (help) {
        help.classList.add('hidden');
      }
    };

    grid.appendChild(p);
  }
}
  function renderBirthday(){const allDone=state.birthdayDone;show('birthdayReveal',allDone);$('hitCount').textContent=state.birthdayHits;$('heartMeterFill').style.width=(state.birthdayHits*10)+'%';$('targetHeart').textContent=state.birthdayHits>=10?'💖':state.birthdayHits>=7?'💔':state.birthdayHits>=4?'❤️‍🔥':'❤️';$('targetHeart').classList.toggle('broken',state.birthdayHits>=10);$('shootBtn').disabled=state.birthdayHits>=10;$('shootBtn').textContent=state.birthdayHits>=10?'Heart opened 🧡':'🏹 Shoot an arrow';if(allDone){$('arrowMessage').textContent='You did it! Every piece of our picture belongs together.';const f=$('fullPhoto');f.innerHTML='';const img=document.createElement('img');img.src=PHOTO;img.alt='Our complete photo';img.onerror=()=>{f.innerHTML='<div class="photo-grid" id="birthdayPhotoGrid"></div>';const pg=f.firstChild;for(let i=0;i<4;i++){const x=document.createElement('div');x.className='photo-part revealed';const im=document.createElement('img');im.src=PHOTO;im.alt='';x.appendChild(im);pg.appendChild(x)}};f.appendChild(img);renderPhotoGrid();$('progressFill').style.width='100%';$('streakLine').textContent='🧡 🧡 🧡 🧡 🧡 5 / 5 days collected';}}
  function startClock(){if(timerHandle)clearInterval(timerHandle);timerHandle=setInterval(()=>{const sch=schedule(),d=determineDay();if(d!==currentDay){currentDay=d;activeGame=0;game={};renderPage();renderJourney();startMusic()}if(currentDay<5){const sec=Math.floor((Date.now()-startedAt)/1000);$('elapsed').textContent=fmtSecs(sec);state.playedSeconds[currentDay-1]=Math.max(state.playedSeconds[currentDay-1]||0,sec);saveState()}},1000)}
  function completeDay(day=currentDay){if(day<1||day>5)return;state.completed[day-1]=true;if(day>=2&&day<=4)state.revealed[day-2]=true;if(day===5){state.completed=[true,true,true,true,true];state.revealed=[true,true,true,true];state.birthdayDone=true}state.gameWins[day-1]=(state.gameWins[day-1]||0)+1;saveState();renderJourney();renderPhotoGrid();renderPage();toast(`🧡 Streak ${day}/5 collected! You did it, love.`);if(day>=2&&day<=4){$('revealTitle').textContent=['','Your first hidden piece: I','The next piece spells LOVE','The third piece says YOU'][day];$('revealCopy').textContent='Unlocked! A little more of us, saved forever in this browser.';$('revealPanel').scrollIntoView({behavior:'smooth',block:'center'})}}
  function newGame(){if(currentDay>=5){toast('Today’s game is the birthday heart challenge!');return}activeGame=0;startedAt=Date.now();game={};setFeedback('Fresh round, fresh butterflies. You’ve got this!');startGameForDay(currentDay)}
  function startGameForDay(day){game={initialized:true,round:1,score:0,step:0,attempts:0,selected:[],matched:[],path:[],turns:0,mini:0};startedAt=Date.now();$('elapsed').textContent='00:00';setFeedback('');if(day===1)renderDay1();if(day===2)renderDay2();if(day===3)renderDay3();if(day===4)renderDay4()}
  function hint(){if(currentDay===1){setFeedback(['Take your time; look for patterns, not speed.','Memory game: say the sequence quietly before tapping.','Word puzzle: tap words in the order they should appear.'][game.mini||0])}else if(currentDay===2)setFeedback('Hint: focus on the order of the four symbols, not how quickly they flash.');else if(currentDay===3)setFeedback('Hint: plan a route to the glowing heart. You can move with the arrow buttons; walls are dark.');else if(currentDay===4)setFeedback('Hint: A=1, B=2, C=3… Use the repeating gaps in the number code.');else toast('Follow your heart 🧡')}
  function finishMini(message){game.score++;setFeedback(message);if(game.score>=3){completeDay(1);$('gameDescription').textContent='All three mini-games cleared! Play again or pick a new mini-game below.';const b=document.createElement('button');b.className='btn btn-primary';b.textContent='Play the mini-games again';b.onclick=()=>{game.score=0;game.mini=0;newGame()};$('gameArea').appendChild(b)}else{game.mini++;setTimeout(()=>renderDay1(),650)}}
  function renderDay1(){const area=$('gameArea');area.innerHTML='';if(game.mini===0){area.innerHTML='<div class="subheading">Mini-game 1 of 3 · Memory Spark</div><p>Watch the four-heart sequence, then tap the matching symbols in the same order. Three rounds to pass.</p><div id="sequenceDisplay" class="sequence-display">Ready? 🧡</div><div class="tiles" id="memoryTiles"></div><div class="center"><button class="btn btn-secondary" id="showSequence">Show sequence</button></div>';const symbols=['🧡','🌙','🌸','⭐'];let seq=[];let round=0;const display=$('sequenceDisplay'),tiles=$('memoryTiles');symbols.forEach(s=>{const b=document.createElement('button');b.className='tile';b.textContent=s;b.onclick=()=>{if(!game.accepting)return;const v=seq[game.step];if(s===v){game.step++;b.classList.add('correct');if(game.step===seq.length){game.accepting=false;round++;if(round>=3)finishMini('Memory Spark cleared! 🧠');else{display.textContent=`Perfect! Round ${round}/3`;setTimeout(next,500)}}}else{display.textContent='Oops! Try that round again 💕';game.step=0;tiles.querySelectorAll('.tile').forEach(x=>x.classList.remove('correct'))}};tiles.appendChild(b)});function next(){seq=Array.from({length:3+round},()=>symbols[Math.floor(Math.random()*symbols.length)]);game.step=0;game.accepting=false;display.textContent=seq.join('  ');setTimeout(()=>{display.textContent='Now repeat it!';game.accepting=true;tiles.querySelectorAll('.tile').forEach(x=>x.classList.remove('correct'))},900)}$('showSequence').onclick=next;next()}else if(game.mini===1){area.innerHTML='<div class="subheading">Mini-game 2 of 3 · Pattern Picnic</div><p>Find the missing number. Tap the answer tile, then solve two more patterns. No MCQs: just tap the number that completes the pattern.</p><h2 class="center" id="patternQuestion"></h2><div class="tiles" id="patternTiles"></div>';const qs=[{q:'2, 4, 8, 16, __',a:32,opts:[24,30,32,36]},{q:'1, 4, 9, 16, __',a:25,opts:[20,24,25,36]},{q:'3, 6, 11, 18, __',a:27,opts:[25,26,27,29]}];let r=0;function draw(){if(r>=qs.length){finishMini('Pattern Picnic complete! Your brain has excellent taste.');return}const q=qs[r];$('patternQuestion').textContent=q.q;$('patternTiles').innerHTML='';q.opts.sort(()=>Math.random()-.5).forEach(n=>{const b=document.createElement('button');b.className='tile';b.textContent=n;b.onclick=()=>{if(n===q.a){r++;draw()}else{b.classList.add('wrong');setFeedback('Not quite, sweetheart. Look at how the numbers grow, then try again!')}};$('patternTiles').appendChild(b)})}draw()}else{area.innerHTML='<div class="subheading">Mini-game 3 of 3 · Build a Love Note</div><p>Tap the words to arrange this scrambled note into a sentence. Tap a placed word to send it back.</p><div id="wordSlots" class="word-slots"></div><div id="wordBank" class="word-bank"></div><div class="center"><button id="checkWords" class="btn btn-primary">Check our little note</button></div>';const words=['you','make','my','ordinary','days','feel','magical'];let order=words.map((w,i)=>({w,i})).sort(()=>Math.random()-.5),chosen=[];const slots=$('wordSlots'),bank=$('wordBank');function draw(){slots.innerHTML='';bank.innerHTML='';chosen.forEach((o,i)=>{const b=document.createElement('button');b.className='slot';b.textContent=o.w;b.onclick=()=>{order.push(o);chosen.splice(i,1);draw()};slots.appendChild(b)});order.forEach(o=>{const b=document.createElement('button');b.className='word-chip';b.textContent=o.w;b.onclick=()=>{chosen.push(o);order=order.filter(x=>x.i!==o.i);draw()};bank.appendChild(b)})}draw();$('checkWords').onclick=()=>{if(chosen.map(x=>x.w).join(' ')==='you make my ordinary days feel magical'){finishMini('Love note assembled perfectly. You make my ordinary days feel magical. 🧡')}else setFeedback('Almost! Rearrange the words into a sentence that makes your heart smile.') }}}
  
function renderDay2(){

  const area = $('gameArea');

  // =========================================================
  // DAY 2
  // 4 GAMES
  // 5 LEVELS EACH
  // TOTAL = 20 LEVELS
  // =========================================================

  let day2Game = 1;
  let day2Level = 1;


  // =========================================================
  // GAME 1
  // NARUTO LOVE SEAL
  // =========================================================

  function renderNarutoGame(){

    day2Game = 1;

    area.innerHTML = `
      <div class="subheading">
        Naruto-inspired challenge · Rebuild the Love Seal
      </div>

      <p>
        Four symbols flash in a secret order.
        Memorise the order, then tap the tiles to rebuild the seal.
        Complete 5 levels. Each level becomes harder.
      </p>

      <div class="center">

        <div class="tiny-label">
          NARUTO LOVE SEAL · LEVEL
          <span id="narutoLevel">1</span> / 5
        </div>

      </div>

      <div id="sealDisplay" class="sequence-display">
        Ready, kunoichi? 🍥
      </div>

      <div id="sealTiles" class="tiles"></div>

      <div class="center">
        <button id="beginSeal" class="btn btn-primary">
          Reveal the seal
        </button>
      </div>
    `;


    const symbols = [
      '🍥',
      '🍃',
      '🔥',
      '🌙',
      '🌀',
      '🦊'
    ];

    let sequence = [];
    let round = 1;
    let position = 0;
    let accepting = false;

    const display = $('sealDisplay');
    const tiles = $('sealTiles');


    // Create symbol buttons
    symbols.forEach(symbol => {

      const button = document.createElement('button');

      button.className = 'tile';
      button.textContent = symbol;

      button.onclick = function(){

        if(!accepting){
          return;
        }

        if(symbol === sequence[position]){

          position++;

          button.classList.add('correct');

          if(position === sequence.length){

            accepting = false;

            if(round === 5){

              display.textContent =
                '🍥 Love Seal completely restored! 🧡';

              setFeedback(
                'Naruto Love Seal complete! 🍥❤️'
              );

              setTimeout(function(){
                renderLoveQuestions();
              }, 1000);

            }else{

              round++;

              $('narutoLevel').textContent = round;

              display.textContent =
                'Perfect! Level ' + (round - 1) + ' cleared! 🧡';

              setTimeout(showNarutoSequence, 800);
            }
          }

        }else{

          accepting = false;
          position = 0;

          tiles
            .querySelectorAll('.tile')
            .forEach(function(tile){
              tile.classList.remove('correct');
            });

          display.textContent =
            'The seal slipped! Try again ❤️';

          setTimeout(showNarutoSequence, 900);
        }

      };

      tiles.appendChild(button);

    });


    function showNarutoSequence(){

      // Level 1 = 3 symbols
      // Level 2 = 4 symbols
      // Level 3 = 5 symbols
      // Level 4 = 6 symbols
      // Level 5 = 7 symbols

      const length = 2 + round;

      sequence = [];

      for(let i = 0; i < length; i++){

        sequence.push(
          symbols[Math.floor(Math.random() * symbols.length)]
        );

      }

      position = 0;
      accepting = false;

      tiles
        .querySelectorAll('.tile')
        .forEach(function(tile){
          tile.classList.remove('correct');
        });

      display.textContent = sequence.join(' ');

      setTimeout(function(){

        display.textContent =
          'Level ' + round + '/5 · Repeat the seal';

        accepting = true;

      }, 1200 + sequence.length * 180);

    }


    $('beginSeal').onclick = showNarutoSequence;

    showNarutoSequence();

  }


  // =========================================================
  // GAME 2
  // LOVE SILLY QUESTIONS
  // =========================================================

  function renderLoveQuestions(){

    day2Game = 2;

    const questions = [

      {
        question:
          "If I suddenly text you 'I miss you' at midnight, what would you reply? 🌙❤️",

        options: [
          "Go to sleep 😂",
          "I miss you too ❤️",
          "Why are you awake? 😭",
          "Seen 😌"
        ],

        answer: 1
      },


      {
        question:
          "If I steal one bite of your food, what should you do? 🍕😂",

        options: [
          "Fight me for it",
          "Give me the whole plate ❤️",
          "Hide the food",
          "Order another one"
        ],

        answer: 1
      },


      {
        question:
          "If we get stuck in an elevator together for 3 hours, what happens? 😂",

        options: [
          "We become enemies",
          "We take 500 selfies ❤️",
          "We sleep",
          "We call everyone"
        ],

        answer: 1
      },


      {
        question:
          "If I say 'I'm not hungry' while staring at your food, what does that mean? 👀",

        options: [
          "I'm actually full",
          "I want your food 😂",
          "I want water",
          "I want to sleep"
        ],

        answer: 1
      },


      {
        question:
          "If our love story became a movie, what should the ending be? 🎬❤️",

        options: [
          "The End",
          "To Be Continued",
          "They lived happily ever after ❤️",
          "Season 2 cancelled 😂"
        ],

        answer: 2
      }

    ];


    let questionNumber = 0;


    function drawQuestion(){

      const q = questions[questionNumber];

      area.innerHTML = `
        <div class="subheading">
          Game 2 of 4 · Love Silly Questions 😂❤️
        </div>

        <p>
          There is only one answer that makes the love story
          a little more perfect. Choose carefully! 😌
        </p>

        <div class="center">

          <div class="tiny-label">
            LOVE LEVEL
            ${questionNumber + 1} / 5
          </div>

          <h2 id="loveQuestion">
            ${q.question}
          </h2>

          <div id="loveOptions" class="tiles"></div>

        </div>
      `;


      const optionsArea = $('loveOptions');


      q.options.forEach(function(option, index){

        const button = document.createElement('button');

        button.className = 'tile';
        button.textContent = option;


        button.onclick = function(){

          if(index === q.answer){

            button.classList.add('correct');

            setFeedback(
              'Correct! 😂❤️ You know this love story!'
            );


            setTimeout(function(){

              questionNumber++;

              if(questionNumber >= questions.length){

                setFeedback(
                  'All 5 silly love questions completed! 💕'
                );

                setTimeout(function(){
                  renderCoupleErrors();
                }, 800);

              }else{

                drawQuestion();

              }

            }, 700);


          }else{

            button.classList.add('wrong');

            setFeedback(
              'Not quite! 😂 Try again, sweetheart.'
            );

            setTimeout(function(){
              button.classList.remove('wrong');
            }, 500);

          }

        };


        optionsArea.appendChild(button);

      });

    }


    drawQuestion();

  }


  // =========================================================
  // GAME 3
  // FIND THE COUPLE PICTURE ERROR
  // =========================================================

  function renderCoupleErrors(){

    day2Game = 3;

    const puzzles = [

      {
        left: '👩🏻 ❤️ 👨🏻',
        right: '👩🏻 💔 👨🏻',

        question: 'What changed?',

        options: [
          'The girl',
          'The heart',
          'The boy',
          'Nothing'
        ],

        answer: 1
      },


      {
        left: '🌙 👩🏻 🤝 👨🏻 ⭐',
        right: '☀️ 👩🏻 🤝 👨🏻 ⭐',

        question: 'Find the error!',

        options: [
          'The couple',
          'The moon',
          'The stars',
          'The hands'
        ],

        answer: 1
      },


      {
        left: '👩🏻 💐 👨🏻',
        right: '👩🏻 🍕 👨🏻',

        question: 'What is different?',

        options: [
          'The girl',
          'The boy',
          'The object between them',
          'Nothing'
        ],

        answer: 2
      },


      {
        left: '👩🏻 😊 ❤️ 👨🏻',
        right: '👩🏻 😭 ❤️ 👨🏻',

        question: 'Spot the tiny change!',

        options: [
          "The girl's expression",
          'The heart',
          "The boy's expression",
          'The background'
        ],

        answer: 0
      },


      {
        left: '🌸 👩🏻 ❤️ 👨🏻 🌸',
        right: '🌸 👩🏻 ❤️ 👨🏻 🌻',

        question: 'Which flower is different?',

        options: [
          'Left flower',
          'The heart',
          'Right flower',
          'Both flowers'
        ],

        answer: 2
      }

    ];


    let puzzleNumber = 0;


    function drawPuzzle(){

      const puzzle = puzzles[puzzleNumber];


      area.innerHTML = `
        <div class="subheading">
          Game 3 of 4 · Find the Couple Picture Error 🔍❤️
        </div>

        <p>
          Look carefully at both pictures.
          One small thing has changed.
          Can you find it?
        </p>

        <div class="center">

          <div class="tiny-label">
            ERROR FINDING LEVEL
            ${puzzleNumber + 1} / 5
          </div>

          <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:15px;
            width:100%;
            max-width:650px;
            margin:20px auto;
          ">

            <div style="
              min-height:130px;
              display:flex;
              align-items:center;
              justify-content:center;
              border-radius:20px;
              background:rgba(255,255,255,.08);
              border:1px solid rgba(255,255,255,.15);
              font-size:42px;
              padding:20px;
              box-sizing:border-box;
            ">
              ${puzzle.left}
            </div>

            <div style="
              min-height:130px;
              display:flex;
              align-items:center;
              justify-content:center;
              border-radius:20px;
              background:rgba(255,255,255,.08);
              border:1px solid rgba(255,255,255,.15);
              font-size:42px;
              padding:20px;
              box-sizing:border-box;
            ">
              ${puzzle.right}
            </div>

          </div>

          <h2>
            ${puzzle.question}
          </h2>

          <div id="errorOptions" class="tiles"></div>

        </div>
      `;


      const optionsArea = $('errorOptions');


      puzzle.options.forEach(function(option, index){

        const button = document.createElement('button');

        button.className = 'tile';
        button.textContent = option;


        button.onclick = function(){

          if(index === puzzle.answer){

            button.classList.add('correct');

            setFeedback(
              'Excellent eyes! 🔍❤️ You found the difference!'
            );


            setTimeout(function(){

              puzzleNumber++;

              if(puzzleNumber >= puzzles.length){

                setFeedback(
                  'All 5 couple picture mysteries solved! 💕'
                );

                setTimeout(function(){
                  renderLoveQuotes();
                }, 800);

              }else{

                drawPuzzle();

              }

            }, 700);


          }else{

            button.classList.add('wrong');

            setFeedback(
              'Look carefully again 👀 Something changed!'
            );

            setTimeout(function(){
              button.classList.remove('wrong');
            }, 500);

          }

        };


        optionsArea.appendChild(button);

      });

    }


    drawPuzzle();

  }


  // =========================================================
  // GAME 4
  // LOVE QUOTES
  // =========================================================

  function renderLoveQuotes(){

    day2Game = 4;

    const quotes = [

      {
        title: 'Level 1 · A Little Reminder 🌸',

        text:
          'You do not have to be perfect to be loved. Being yourself is already one of my favourite things about you.'
      },


      {
        title: 'Level 2 · Your Smile 😊',

        text:
          'If I could keep one sound forever, I would choose your laugh. Somehow it makes even an ordinary day feel special.'
      },


      {
        title: 'Level 3 · From My Heart ❤️',

        text:
          'I may not always have the perfect words, but my heart keeps choosing you in every language it knows.'
      },


      {
        title: 'Level 4 · A Little Forever 🌙',

        text:
          'Among all the beautiful moments life could give me, I would still choose the moments where I get to see you smile.'
      },


      {
        title: 'Level 5 · My Final Note 💌',

        text:
          'You are not just a chapter in my story. You are the reason I want to keep writing the story, page after page, day after day.'
      }

    ];


    let quoteNumber = 0;


    function drawQuote(){

      const quote = quotes[quoteNumber];


      area.innerHTML = `
        <div class="subheading">
          Game 4 of 4 · Make Her Heart Smile 💌
        </div>

        <p>
          Take a moment and read this little message.
          This level is about making your heart smile. ❤️
        </p>

        <div class="center">

          <div class="tiny-label">
            LOVE NOTE
            ${quoteNumber + 1} / 5
          </div>

          <div style="
            max-width:650px;
            margin:25px auto;
            padding:30px 25px;
            border-radius:25px;
            background:rgba(255,255,255,.08);
            border:1px solid rgba(255,255,255,.15);
            box-shadow:0 15px 45px rgba(0,0,0,.15);
          ">

            <h2>
              ${quote.title}
            </h2>

            <p style="
              font-size:1.15rem;
              line-height:1.8;
              margin-top:20px;
            ">
              “${quote.text}”
            </p>

            <div style="
              font-size:2rem;
              margin-top:20px;
            ">
              🧡 💕 🌸
            </div>

          </div>

          <button
            id="smileButton"
            class="btn btn-primary"
          >
            💕 This made my heart smile
          </button>

        </div>
      `;


      $('smileButton').onclick = function(){

        this.disabled = true;

        setFeedback(
          'A little love sent directly to your heart. 💕'
        );


        setTimeout(function(){

          quoteNumber++;


          if(quoteNumber >= quotes.length){

            // ============================================
            // ALL DAY 2 GAMES COMPLETED
            // ============================================

            area.innerHTML = `
              <div class="center">

                <div class="subheading">
                  DAY 2 COMPLETE 💕
                </div>

                <h2>
                  You completed all 20 love levels! 🍥❤️
                </h2>

                <p>
                  Naruto Love Seal ✔️<br>
                  Silly Love Questions ✔️<br>
                  Couple Detective ✔️<br>
                  Love Notes ✔️
                </p>

                <div style="
                  font-size:3rem;
                  margin:25px 0;
                ">
                  🍥 😂 🔍 💌 🧡
                </div>

                <p>
                  Your first hidden picture piece has been unlocked.
                </p>

              </div>
            `;


            // Complete Day 2 ONLY here
            completeDay(2);


          }else{

            drawQuote();

          }

        }, 900);

      };

    }


    drawQuote();

  }


  // =========================================================
  // START DAY 2
  // =========================================================

  renderNarutoGame();

}

function renderDay3(){

  const area = $('gameArea');

  // =========================================================
  // DAY 3
  // 6 LOVE GAMES
  // =========================================================

  let gameNumber = 1;
  let level = 1;

  // Prevent old keyboard handlers from previous Day 3 games
  window.onkeydown = null;


  // =========================================================
  // GAME 1
  // EXISTING HEART MAZE
  // =========================================================

  function renderMazeGame(){

    gameNumber = 1;

    area.innerHTML = `
      <div class="subheading">
        Game 1 of 6 · Find the way back to my heart 🍃
      </div>

      <p>
        Guide the little orange heart through the maze to the flower.
        Dark squares are walls. Use the direction controls and find
        the path back to my heart.
      </p>

      <div class="center">
        <b>Moves: <span id="moveCount">0</span></b>
      </div>

      <div id="mazeBoard" class="board"></div>

      <div class="tiles"
        style="grid-template-columns:repeat(3,1fr);max-width:230px">

        <button class="tile" data-move="up">↑</button>

        <button class="tile" data-move="left">←</button>

        <button class="tile" data-move="right">→</button>

        <button class="tile" data-move="down">↓</button>

        <button class="tile" id="undoMove">↶ Undo</button>

        <button class="tile" id="resetMaze">↻ Reset</button>

      </div>
    `;


    const walls = new Set([
      3,5,8,11,13,16,18,21
    ]);

    const W = 5;
    const start = 0;
    const goal = 24;

    let pos = start;
    let visited = [start];
    let history = [];
    let finished = false;


    function draw(){

      const board = $('mazeBoard');

      if(!board) return;

      board.innerHTML = '';

      for(let i = 0; i < 25; i++){

        const button = document.createElement('button');

        if(i === pos){
          button.textContent = '🧡';
        }
        else if(i === goal){
          button.textContent = '🌸';
        }
        else if(walls.has(i)){
          button.textContent = '';
        }
        else if(visited.includes(i)){
          button.textContent = '·';
        }
        else{
          button.textContent = '';
        }

        if(walls.has(i)){
          button.classList.add('wall');
        }

        if(i === pos){
          button.classList.add('player');
        }

        if(i === goal){
          button.classList.add('goal');
        }

        if(visited.includes(i)){
          button.classList.add('visited');
        }

        board.appendChild(button);
      }

      $('moveCount').textContent = history.length;
    }


    function move(direction){

      if(finished) return;

      const row = Math.floor(pos / W);
      const col = pos % W;

      let newRow = row;
      let newCol = col;

      if(direction === 'up') newRow--;
      if(direction === 'down') newRow++;
      if(direction === 'left') newCol--;
      if(direction === 'right') newCol++;


      if(
        newRow < 0 ||
        newRow >= W ||
        newCol < 0 ||
        newCol >= W
      ){
        return;
      }


      const next = newRow * W + newCol;


      if(walls.has(next)){

        setFeedback(
          'Bonk! 🧱 That way is blocked. Try another route!'
        );

        return;
      }


      history.push(pos);

      pos = next;

      visited.push(pos);

      draw();


      if(pos === goal){

        finished = true;

        setFeedback(
          `Heart found in ${history.length} moves! 🧡`
        );

        setTimeout(function(){
          renderLoveArrows();
        },1000);
      }
    }


    area.querySelectorAll('[data-move]').forEach(function(button){

      button.onclick = function(){
        move(button.dataset.move);
      };

    });


    $('undoMove').onclick = function(){

      if(history.length > 0 && !finished){

        pos = history.pop();

        visited.push(pos);

        draw();

      }

    };


    $('resetMaze').onclick = function(){

      if(finished) return;

      pos = start;
      visited = [start];
      history = [];

      draw();

      setFeedback(
        'Maze reset. Same heart, new route. ❤️'
      );

    };


    window.onkeydown = function(e){

      if(finished) return;

      const map = {
        ArrowUp:'up',
        ArrowDown:'down',
        ArrowLeft:'left',
        ArrowRight:'right'
      };

      if(map[e.key]){

        e.preventDefault();

        move(map[e.key]);
      }

    };


    draw();

  }


  // =========================================================
  // GAME 2
  // LOVE ARROWS
  // =========================================================

  function renderLoveArrows(){

    gameNumber = 2;

    let arrowLevel = 1;

    const targets = [
      {
        size: 95,
        speed: 0,
        text: 'Hit the heart! ❤️'
      },
      {
        size: 80,
        speed: 0,
        text: 'A little smaller! 💕'
      },
      {
        size: 65,
        speed: 0,
        text: 'Careful... 🎯'
      },
      {
        size: 52,
        speed: 0,
        text: 'Almost impossible! 😈'
      },
      {
        size: 42,
        speed: 0,
        text: 'Final love shot! ❤️‍🔥'
      }
    ];


    function draw(){

      const target = targets[arrowLevel - 1];

      area.innerHTML = `
        <div class="subheading">
          Game 2 of 6 · Love Arrows 🏹❤️
        </div>

        <p>
          Click the moving heart with your arrow.
          The target gets smaller every level.
        </p>

        <div class="center">

          <div class="tiny-label">
            LOVE ARROW LEVEL
            ${arrowLevel} / 5
          </div>

          <div id="arrowArena"
            style="
              position:relative;
              width:100%;
              max-width:650px;
              height:320px;
              margin:20px auto;
              border-radius:25px;
              overflow:hidden;
              background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.15);
            ">

            <button id="movingHeart"
              style="
                position:absolute;
                width:${target.size}px;
                height:${target.size}px;
                border:none;
                border-radius:50%;
                background:transparent;
                font-size:${Math.max(25,target.size * .55)}px;
                cursor:pointer;
                transition:left .25s ease,top .25s ease;
              ">
              ❤️
            </button>

          </div>

          <p id="arrowInstruction">
            ${target.text}
          </p>

        </div>
      `;


      const heart = $('movingHeart');
      const arena = $('arrowArena');

      function moveHeart(){

        const maxX =
          Math.max(0, arena.clientWidth - target.size);

        const maxY =
          Math.max(0, arena.clientHeight - target.size);

        const x =
          Math.floor(Math.random() * (maxX + 1));

        const y =
          Math.floor(Math.random() * (maxY + 1));

        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
      }


      moveHeart();


      let moving = true;

      const interval = setInterval(function(){

        if(!moving){
          clearInterval(interval);
          return;
        }

        moveHeart();

      }, Math.max(350,850 - arrowLevel * 90));


      heart.onclick = function(){

        moving = false;

        clearInterval(interval);

        heart.textContent = '💘';

        setFeedback(
          'Bullseye! Your love arrow found its target! 🏹❤️'
        );


        setTimeout(function(){

          arrowLevel++;

          if(arrowLevel > 5){

            renderLoveBird();

          }else{

            draw();

          }

        },700);

      };

    }


    draw();

  }


  // =========================================================
  // GAME 3
  // SIMPLE LOVE BIRD GAME
  // =========================================================

  function renderLoveBird() {

  gameNumber = 3;

  let score = 0;
  let heartsCaught = 0;
  let timeLeft = 40;
  let gameStarted = false;
  let gameFinished = false;

  let timerInterval = null;
  let heartMoveInterval = null;

  const loveMessages = [
    "You caught my heart... ❤️",
    "If I could choose again, I'd still choose you. 💕",
    "Every little moment with you feels special. 🥰",
    "You make ordinary days feel beautiful. 🌸",
    "My favorite place is wherever you are. 💗",
    "You somehow make my heart smile. 😊❤️",
    "I don't need perfect days... I just need you. 💕",
    "You are one of my favorite reasons to smile. 🥹",
    "If my heart had a home, it would be with you. 🏡❤️",
    "You caught all my hearts... because they were always yours. 💖"
  ];

  area.innerHTML = `
    <div class="subheading">
      Game 3 of 6 · Catch My Heart 💕
    </div>

    <p style="font-size:16px; opacity:.9;">
      There are 10 little pieces of my heart hidden here... 💌
    </p>

    <div class="center">

      <div style="
        display:flex;
        justify-content:center;
        gap:20px;
        flex-wrap:wrap;
        margin:15px 0;
        font-weight:bold;
        font-size:16px;
      ">

        <div>
          💖 Score:
          <span id="heartScore">0</span>
        </div>

        <div>
          💕 Hearts:
          <span id="heartCount">0</span> / 10
        </div>

        <div>
          ⏰ Time:
          <span id="heartTimer">40</span>s
        </div>

      </div>

      <div id="heartGameArea"
        style="
          position:relative;
          width:100%;
          max-width:680px;
          height:390px;
          margin:20px auto;
          overflow:hidden;
          border-radius:30px;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(255,255,255,.35),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              rgba(255,100,160,.28),
              rgba(170,100,255,.25),
              rgba(255,190,210,.28)
            );
          border:2px solid rgba(255,255,255,.25);
          box-shadow:0 15px 45px rgba(150,50,100,.18);
          cursor:pointer;
          user-select:none;
          touch-action:manipulation;
        ">

        <div style="
          position:absolute;
          left:8%;
          top:15%;
          font-size:20px;
          opacity:.45;
          animation:loveFloat1 4s ease-in-out infinite;
          pointer-events:none;
        ">
          💕
        </div>

        <div style="
          position:absolute;
          right:12%;
          top:25%;
          font-size:25px;
          opacity:.40;
          animation:loveFloat2 5s ease-in-out infinite;
          pointer-events:none;
        ">
          💗
        </div>

        <div style="
          position:absolute;
          left:18%;
          bottom:15%;
          font-size:18px;
          opacity:.35;
          animation:loveFloat1 6s ease-in-out infinite;
          pointer-events:none;
        ">
          ❤️
        </div>

        <div style="
          position:absolute;
          right:20%;
          bottom:12%;
          font-size:22px;
          opacity:.40;
          animation:loveFloat2 4.5s ease-in-out infinite;
          pointer-events:none;
        ">
          💖
        </div>

        <div style="
          position:absolute;
          left:25%;
          top:20%;
          font-size:16px;
          animation:loveSparkle 2s infinite;
          pointer-events:none;
        ">
          ✨
        </div>

        <div style="
          position:absolute;
          right:28%;
          top:15%;
          font-size:18px;
          animation:loveSparkle 2.5s infinite;
          pointer-events:none;
        ">
          ✨
        </div>

        <div style="
          position:absolute;
          left:40%;
          bottom:15%;
          font-size:14px;
          animation:loveSparkle 3s infinite;
          pointer-events:none;
        ">
          ✨
        </div>

        <div id="heartStartMessage"
          style="
            position:absolute;
            inset:0;
            display:flex;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            text-align:center;
            padding:25px;
            pointer-events:none;
            z-index:15;
          ">

          <div style="
            font-size:45px;
            margin-bottom:10px;
          ">
            💌
          </div>

          <div style="
            font-size:23px;
            font-weight:bold;
          ">
            A little secret...
          </div>

          <div style="
            margin-top:8px;
            font-size:15px;
            opacity:.85;
          ">
            Catch my heart to discover it ❤️
          </div>

        </div>

        <div id="flyingHeart"
          style="
            position:absolute;
            left:50%;
            top:50%;
            width:75px;
            height:75px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:55px;
            z-index:20;
            cursor:pointer;
            filter:drop-shadow(
              0 8px 15px rgba(255,30,100,.35)
            );
            transition:
              left .25s ease,
              top .25s ease,
              transform .20s ease;
          ">
          ❤️
        </div>

        <div id="loveReveal"
          style="
            position:absolute;
            inset:0;
            display:none;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            text-align:center;
            padding:30px;
            background:rgba(255,170,205,.22);
            backdrop-filter:blur(5px);
            z-index:30;
            pointer-events:none;
          ">

          <div id="revealHeart"
            style="
              font-size:65px;
              margin-bottom:12px;
            ">
            ❤️
          </div>

          <div id="revealText"
            style="
              font-size:20px;
              font-weight:bold;
              line-height:1.5;
              max-width:500px;
            ">
          </div>

        </div>

      </div>

      <div id="heartMessage"
        style="
          min-height:55px;
          margin:15px auto;
          max-width:600px;
          font-size:17px;
          font-weight:bold;
          line-height:1.5;
        ">
        💕 My heart is waiting for you...
      </div>

      <p style="
        opacity:.75;
        font-size:14px;
      ">
        Click / Tap the ❤️ whenever you find it.
      </p>

    </div>

    <style>

      @keyframes loveFloat1 {
        0% {
          transform:translateY(0);
        }

        50% {
          transform:translateY(-15px);
        }

        100% {
          transform:translateY(0);
        }
      }

      @keyframes loveFloat2 {
        0% {
          transform:translateY(0) rotate(0deg);
        }

        50% {
          transform:translateY(-12px) rotate(8deg);
        }

        100% {
          transform:translateY(0) rotate(0deg);
        }
      }

      @keyframes loveBeat {
        0% {
          transform:scale(1);
        }

        25% {
          transform:scale(1.25);
        }

        45% {
          transform:scale(1);
        }

        65% {
          transform:scale(1.15);
        }

        100% {
          transform:scale(1);
        }
      }

      @keyframes loveSparkle {
        0% {
          opacity:.2;
          transform:scale(.7);
        }

        50% {
          opacity:1;
          transform:scale(1.2);
        }

        100% {
          opacity:.2;
          transform:scale(.7);
        }
      }

      @keyframes loveParticle {
        0% {
          opacity:1;
          transform:translate(0,0) scale(1);
        }

        100% {
          opacity:0;
          transform:
            translate(
              var(--particle-x),
              var(--particle-y)
            )
            scale(.3);
        }
      }

    </style>
  `;

  const gameArea = $("heartGameArea");
  const heart = $("flyingHeart");
  const scoreText = $("heartScore");
  const countText = $("heartCount");
  const timerText = $("heartTimer");
  const messageText = $("heartMessage");
  const startMessage = $("heartStartMessage");
  const reveal = $("loveReveal");
  const revealText = $("revealText");
  const revealHeart = $("revealHeart");

  if (
    !gameArea ||
    !heart ||
    !scoreText ||
    !countText ||
    !timerText ||
    !messageText ||
    !startMessage ||
    !reveal ||
    !revealText ||
    !revealHeart
  ) {
    console.error("Game 3: Required elements were not found.");
    return;
  }

  function moveHeart() {

    if (gameFinished) {
      return;
    }

    const width = gameArea.clientWidth;
    const height = gameArea.clientHeight;
    const heartSize = 75;

    const maxX = Math.max(
      10,
      width - heartSize - 10
    );

    const maxY = Math.max(
      10,
      height - heartSize - 10
    );

    const x = 10 + Math.random() * maxX;
    const y = 10 + Math.random() * maxY;

    const rotation = -12 + Math.random() * 24;

    heart.style.left = x + "px";
    heart.style.top = y + "px";

    heart.style.transform =
      "scale(1) rotate(" +
      rotation +
      "deg)";
  }

  function startGame() {

    if (gameStarted || gameFinished) {
      return;
    }

    gameStarted = true;

    startMessage.style.display = "none";

    messageText.innerHTML =
      "Find my heart... ❤️";

    moveHeart();

    timerInterval = setInterval(function() {

      if (gameFinished) {
        return;
      }

      timeLeft--;

      timerText.textContent = timeLeft;

      if (timeLeft <= 0) {
        finishGame(false);
      }

    }, 1000);

    heartMoveInterval = setInterval(function() {

      if (gameStarted && !gameFinished) {
        moveHeart();
      }

    }, 2200);
  }

  function createHeartParticles() {

    for (let i = 0; i < 8; i++) {

      const particle =
        document.createElement("div");

      particle.textContent =
        i % 2 === 0 ? "💕" : "✨";

      particle.style.position = "absolute";
      particle.style.left = "50%";
      particle.style.top = "50%";
      particle.style.fontSize = "20px";
      particle.style.zIndex = "40";
      particle.style.pointerEvents = "none";

      const angle =
        Math.random() * Math.PI * 2;

      const distance =
        50 + Math.random() * 80;

      const x =
        Math.cos(angle) * distance;

      const y =
        Math.sin(angle) * distance;

      particle.style.setProperty(
        "--particle-x",
        x + "px"
      );

      particle.style.setProperty(
        "--particle-y",
        y + "px"
      );

      particle.style.animation =
        "loveParticle .8s ease-out forwards";

      gameArea.appendChild(particle);

      setTimeout(function() {

        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }

      }, 800);
    }
  }

  function catchHeart(e) {

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (gameFinished) {
      return;
    }

    if (!gameStarted) {
      startGame();
      return;
    }

    score += 10;
    heartsCaught++;

    scoreText.textContent = score;
    countText.textContent = heartsCaught;

    messageText.innerHTML =
      loveMessages[heartsCaught - 1];

    heart.style.animation =
      "loveBeat .5s ease";

    setTimeout(function() {

      if (!gameFinished) {
        heart.style.animation = "";
      }

    }, 500);

    createHeartParticles();

    revealText.textContent =
      loveMessages[heartsCaught - 1];

    revealHeart.textContent =
      heartsCaught === 10 ? "💖" : "❤️";

    reveal.style.display = "flex";

    setTimeout(function() {

      if (!gameFinished) {
        reveal.style.display = "none";
      }

    }, 900);

    if (heartsCaught >= 10) {

      setTimeout(function() {
        finishGame(true);
      }, 700);

      return;
    }

    setTimeout(function() {

      if (!gameFinished) {
        moveHeart();
      }

    }, 250);
  }

  heart.addEventListener(
    "click",
    catchHeart
  );

  heart.addEventListener(
    "touchstart",
    catchHeart,
    { passive: false }
  );

  function finishGame(won) {

    if (gameFinished) {
      return;
    }

    gameFinished = true;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (heartMoveInterval) {
      clearInterval(heartMoveInterval);
      heartMoveInterval = null;
    }

    heart.style.pointerEvents = "none";

    if (won) {

      reveal.style.display = "flex";

      reveal.innerHTML = `

        <div style="
          font-size:75px;
          animation:loveBeat 1s infinite;
        ">
          💖
        </div>

        <div style="
          font-size:25px;
          font-weight:bold;
          margin-top:10px;
        ">
          You caught all my hearts.
        </div>

        <div style="
          font-size:18px;
          margin-top:12px;
          line-height:1.6;
          max-width:500px;
        ">
          But there's something you should know...
          <br><br>

          You didn't really catch them. ❤️
          <br>

          <b>
            They were already yours.
          </b>
          💕
        </div>

      `;

      messageText.innerHTML =
        "Every piece of my heart belongs to you. ❤️";

      setFeedback(
        "You found all my hearts... ❤️💕"
      );

      setTimeout(function() {
        renderLovePuzzle();
      }, 3000);

    } else {

      reveal.style.display = "flex";

      reveal.innerHTML = `

        <div style="
          font-size:65px;
        ">
          💔
        </div>

        <div style="
          font-size:23px;
          font-weight:bold;
          margin-top:10px;
        ">
          Time's up...
        </div>

        <div style="
          font-size:17px;
          margin-top:12px;
          line-height:1.5;
        ">
          But don't worry...
          <br>
          My heart is still waiting for you. ❤️
        </div>

      `;

      messageText.innerHTML =
        "Try again and catch my heart. 💕";

      setFeedback(
        "My heart is still waiting for you! ❤️"
      );

      setTimeout(function() {
        renderLoveBird();
      }, 1800);
    }
  }

  heart.style.left =
    "calc(50% - 37px)";

  heart.style.top =
    "calc(50% - 37px)";
}
  // =========================================================
  // GAME 4
  // LOVE PUZZLE SOLVING
  // =========================================================

  function renderLovePuzzle(){

    gameNumber = 4;

    let puzzleLevel = 1;


    const puzzles = [

      {
        question:'I have a heart but no body. What am I?',
        options:[
          'A card',
          'A tree',
          'A cloud',
          'A shoe'
        ],
        answer:0
      },

      {
        question:'What comes next? ❤️ 💕 ❤️ 💕 ❤️ __',
        options:[
          '💔',
          '💕',
          '🌸',
          '⭐'
        ],
        answer:1
      },

      {
        question:'If LOVE = 12 + 15 + 22 + 5, what is LOVE?',
        options:[
          '44',
          '54',
          '64',
          '74'
        ],
        answer:1
      },

      {
        question:'Which word does NOT belong with the others?',
        options:[
          'Heart',
          'Love',
          'Smile',
          'Keyboard'
        ],
        answer:3
      },

      {
        question:'Complete the pattern: 2, 4, 8, 16, __',
        options:[
          '20',
          '24',
          '32',
          '36'
        ],
        answer:2
      }

    ];


    function draw(){

      const puzzle = puzzles[puzzleLevel - 1];


      area.innerHTML = `
        <div class="subheading">
          Game 4 of 6 · Love Puzzle Solving 🧩❤️
        </div>

        <p>
          Think carefully. The final levels require
          pattern recognition and a little logic.
        </p>

        <div class="center">

          <div class="tiny-label">
            PUZZLE LEVEL
            ${puzzleLevel} / 5
          </div>

          <h2>
            ${puzzle.question}
          </h2>

          <div id="puzzleOptions" class="tiles"></div>

        </div>
      `;


      const options = $('puzzleOptions');


      puzzle.options.forEach(function(option,index){

        const button = document.createElement('button');

        button.className = 'tile';

        button.textContent = option;


        button.onclick = function(){

          if(index === puzzle.answer){

            button.classList.add('correct');

            setFeedback(
              'Correct! 🧩❤️ Your love IQ is impressive!'
            );


            setTimeout(function(){

              puzzleLevel++;

              if(puzzleLevel > 5){

                renderLoveSentence();

              }else{

                draw();

              }

            },700);


          }else{

            button.classList.add('wrong');

            setFeedback(
              'Not quite! Think carefully and try again. 🧠❤️'
            );

            setTimeout(function(){
              button.classList.remove('wrong');
            },500);

          }

        };


        options.appendChild(button);

      });

    }


    draw();

  }


  // =========================================================
  // GAME 5
  // COMPLETE MY LOVE SENTENCE
  // =========================================================

  function renderLoveSentence(){

    gameNumber = 5;

    let sentenceLevel = 1;


    const levels = [

      {
        sentence:'You are my ______ person.',
        options:[
          'favourite',
          'random',
          'boring',
          'strange'
        ],
        answer:0
      },

      {
        sentence:'Your smile makes my ______ brighter.',
        options:[
          'keyboard',
          'day',
          'shoe',
          'phone'
        ],
        answer:1
      },

      {
        sentence:'If love had a name, I would call it ______.',
        options:[
          'Monday',
          'You',
          'Homework',
          'Traffic'
        ],
        answer:1
      },

      {
        sentence:'No matter how far I go, my heart always finds its way ______ you.',
        options:[
          'away from',
          'past',
          'back to',
          'under'
        ],
        answer:2
      },

      {
        sentence:'My favourite place is wherever I am ______ you.',
        options:[
          'without',
          'with',
          'against',
          'before'
        ],
        answer:1
      }

    ];


    function draw(){

      const item = levels[sentenceLevel - 1];


      area.innerHTML = `
        <div class="subheading">
          Game 5 of 6 · Complete My Love Sentence 💌
        </div>

        <p>
          Choose the word that makes the sentence feel right.
        </p>

        <div class="center">

          <div class="tiny-label">
            LOVE SENTENCE
            ${sentenceLevel} / 5
          </div>

          <div style="
            max-width:650px;
            margin:25px auto;
            padding:30px;
            border-radius:25px;
            background:rgba(255,255,255,.08);
          ">

            <h2>
              ${item.sentence}
            </h2>

          </div>

          <div id="sentenceOptions" class="tiles"></div>

        </div>
      `;


      const options = $('sentenceOptions');


      item.options.forEach(function(option,index){

        const button = document.createElement('button');

        button.className = 'tile';
        button.textContent = option;


        button.onclick = function(){

          if(index === item.answer){

            button.classList.add('correct');

            setFeedback(
              'Perfect sentence! 💕'
            );


            setTimeout(function(){

              sentenceLevel++;

              if(sentenceLevel > 5){

                renderHeartChoice();

              }else{

                draw();

              }

            },700);


          }else{

            button.classList.add('wrong');

            setFeedback(
              'Try another word. ❤️'
            );

            setTimeout(function(){
              button.classList.remove('wrong');
            },500);

          }

        };


        options.appendChild(button);

      });

    }


    draw();

  }


  // =========================================================
  // GAME 6
  // HEART CHOICE CHALLENGE
  // =========================================================

  function renderHeartChoice(){

    gameNumber = 6;

    let choiceLevel = 1;


    const levels = [

      {
        question:
          'Which would make the sweetest surprise? 🎁',

        options:[
          'A thoughtful handwritten note',
          'A broken chair',
          'An empty box',
          'A parking ticket'
        ],

        answer:0
      },

      {
        question:
          'What matters most in a relationship? ❤️',

        options:[
          'Trust and understanding',
          'Winning every argument',
          'Never talking',
          'Keeping score'
        ],

        answer:0
      },

      {
        question:
          'If she had a bad day, what would be the best response? 🌸',

        options:[
          'Ignore her',
          'Make fun of her',
          'Listen and be there for her',
          'Start an argument'
        ],

        answer:2
      },

      {
        question:
          'Which tiny thing can become a huge romantic memory? 🌙',

        options:[
          'A shared laugh',
          'A random receipt',
          'A broken pencil',
          'A traffic signal'
        ],

        answer:0
      },

      {
        question:
          'What is the strongest kind of love? 💖',

        options:[
          'Love that is only there on good days',
          'Love that stays, understands and grows',
          'Love that never communicates',
          'Love that keeps secrets'
        ],

        answer:1
      }

    ];


    function draw(){

      const item = levels[choiceLevel - 1];


      area.innerHTML = `
        <div class="subheading">
          Game 6 of 6 · Heart Choice Challenge 🌸❤️
        </div>

        <p>
          The final challenge of Day 3.
          Choose the answer that feels most like real love.
        </p>

        <div class="center">

          <div class="tiny-label">
            HEART CHALLENGE
            ${choiceLevel} / 5
          </div>

          <h2>
            ${item.question}
          </h2>

          <div id="heartOptions" class="tiles"></div>

        </div>
      `;


      const options = $('heartOptions');


      item.options.forEach(function(option,index){

        const button = document.createElement('button');

        button.className = 'tile';
        button.textContent = option;


        button.onclick = function(){

          if(index === item.answer){

            button.classList.add('correct');

            setFeedback(
              'Your heart chose beautifully. ❤️'
            );


            setTimeout(function(){

              choiceLevel++;

              if(choiceLevel > 5){

                finishDay3();

              }else{

                draw();

              }

            },750);


          }else{

            button.classList.add('wrong');

            setFeedback(
              'Think with your heart and try again. 💕'
            );

            setTimeout(function(){
              button.classList.remove('wrong');
            },500);

          }

        };


        options.appendChild(button);

      });

    }


    draw();

  }


  // =========================================================
  // DAY 3 COMPLETE
  // =========================================================

  function finishDay3(){

    window.onkeydown = null;

    area.innerHTML = `
      <div class="center">

        <div class="subheading">
          DAY 3 COMPLETE 💕
        </div>

        <h2>
          You found your way back to my heart! 🧡
        </h2>

        <p>
          Maze completed ✔️<br>
          Love arrows completed ✔️<br>
          Love bird completed ✔️<br>
          Love puzzles completed ✔️<br>
          Love sentences completed ✔️<br>
          Heart challenges completed ✔️
        </p>

        <div style="
          font-size:3rem;
          margin:25px 0;
        ">
          🍃 🏹 🐦 🧩 💌 🌸
        </div>

        <p>
          Another little piece of our story has been unlocked. ❤️
        </p>

      </div>
    `;

    setFeedback(
      'Day 3 complete! Your heart found its way home. 🧡'
    );

    // This is the ONLY place Day 3 is completed.
    completeDay(3);

  }


  // =========================================================
  // START GAME 1
  // =========================================================

  renderMazeGame();

}
function renderDay4() {

  const area = $('gameArea');

  let currentGame = 1;

  /*
  ============================================================
  GAME 1 - SECRET LOVE CIPHER
  ============================================================
  */

  function game1() {

    currentGame = 1;

    area.innerHTML = `
      <div class="subheading">
        Difficult · Game 1 of 6 · The Secret Love Cipher 🔐
      </div>

      <p>
        Decode four messages to unlock “YOU”.
        Each code uses A=1, B=2, … Z=26.
        Numbers are separated by hyphens.
        Solve one, then the next message gets trickier.
        Type the answer, not a multiple-choice guess.
      </p>

      <div class="center">

        <div class="tiny-label">
          MESSAGE <span id="cipherRound">1</span> / 4
        </div>

        <h2 id="cipherCode"
            style="letter-spacing:.12em;">
        </h2>

        <p id="cipherClue" class="muted"></p>

        <div class="input-row">

          <input
            id="cipherInput"
            class="text-input"
            autocomplete="off"
            placeholder="Type the decoded word"
          >

          <button
            id="cipherSubmit"
            class="btn btn-primary">
            Decode
          </button>

        </div>

      </div>
    `;

    const qs = [
      {
        code: '25-15-21',
        answer: 'YOU',
        clue: 'The person this whole website is for.'
      },
      {
        code: '13-25',
        answer: 'MY',
        clue: 'A tiny word that makes “favourite person” sound personal.'
      },
      {
        code: '19-21-14-19-8-9-14-5',
        answer: 'SUNSHINE',
        clue: 'Someone who brightens your day.'
      },
      {
        code: '6-15-18-5-22-5-18',
        answer: 'FOREVER',
        clue: 'How long this little website hopes to make you smile.'
      }
    ];

    let r = 0;

    function draw() {

      if (r >= qs.length) {
        game2();
        return;
      }

      const q = qs[r];

      $('cipherRound').textContent = r + 1;
      $('cipherCode').textContent = q.code;
      $('cipherClue').textContent = q.clue;
      $('cipherInput').value = '';

      $('cipherInput').focus();
    }

    function check() {

      const input =
        $('cipherInput').value.trim().toUpperCase();

      if (input === qs[r].answer) {

        r++;

        setFeedback('Decoded! 🧡');

        draw();

      } else {

        setFeedback(
          'Not yet, detective. Convert each number into its alphabet letter and try again.'
        );

      }
    }

    $('cipherSubmit').onclick = check;

    $('cipherInput').onkeydown = function(e) {

      if (e.key === 'Enter') {
        check();
      }

    };

    draw();
  }


  /*
  ============================================================
  GAME 2 - KINDER CHOCOLATE SURPRISE
  ============================================================
  */

  function game2() {

    currentGame = 2;

    area.innerHTML = `

      <div class="subheading">
        Game 2 of 6 · The Chocolate Surprise 🍫
      </div>

      <p>
        Someone left you a little chocolate surprise...
        Open it carefully and discover what is hiding inside. ❤️
      </p>

      <div class="center">

        <div id="chocoStage"
          style="
            max-width:600px;
            margin:25px auto;
            padding:25px;
            border-radius:28px;
            background:
              linear-gradient(
                135deg,
                rgba(255,190,210,.30),
                rgba(255,220,170,.30)
              );
            border:2px solid rgba(255,255,255,.3);
          ">

          <div id="chocoEmoji"
            style="
              font-size:110px;
              cursor:pointer;
              user-select:none;
              transition:transform .3s;
            ">
            🥚
          </div>

          <h2 id="chocoTitle">
            A Mystery Chocolate Egg
          </h2>

          <p id="chocoText">
            Tap the egg to start opening your surprise.
          </p>

          <button
            id="chocoButton"
            class="btn btn-primary">
            Open the Egg 🍫
          </button>

        </div>

        <div id="toyArea"
          style="
            display:none;
            max-width:600px;
            margin:20px auto;
          ">

          <div
            style="
              font-size:80px;
              margin:15px;
            "
            id="toyEmoji">
            🐰
          </div>

          <h2 id="toyName">
            Your Surprise Toy!
          </h2>

          <p id="toyText">
            Tap the toy and see what it can do!
          </p>

          <button
            id="toyButton"
            class="btn btn-primary">
            Play With Toy 🎮
          </button>

        </div>

      </div>
    `;

    const stages = [
      {
        emoji: '🥚',
        title: 'A Mystery Chocolate Egg',
        text: 'Tap the egg to start opening your surprise.',
        button: 'Open the Egg 🍫'
      },
      {
        emoji: '🍫',
        title: 'Chocolate Found!',
        text: 'Yum! But something is hiding inside...',
        button: 'Open the Chocolate ❤️'
      },
      {
        emoji: '🧻',
        title: 'Unwrapping...',
        text: 'Carefully unwrap the little surprise.',
        button: 'Open The Surprise 🎁'
      },
      {
        emoji: '🎁',
        title: 'Something Is Inside!',
        text: 'One final step... open the capsule!',
        button: 'Open Capsule ✨'
      }
    ];

    let stage = 0;

    const chocoEmoji = $('chocoEmoji');
    const chocoTitle = $('chocoTitle');
    const chocoText = $('chocoText');
    const chocoButton = $('chocoButton');

    const toyArea = $('toyArea');
    const toyEmoji = $('toyEmoji');
    const toyName = $('toyName');
    const toyText = $('toyText');
    const toyButton = $('toyButton');

    function showStage() {

      const s = stages[stage];

      chocoEmoji.textContent = s.emoji;
      chocoTitle.textContent = s.title;
      chocoText.textContent = s.text;
      chocoButton.textContent = s.button;

    }

    chocoButton.onclick = function() {

      stage++;

      chocoEmoji.style.transform =
        'scale(1.3) rotate(8deg)';

      setTimeout(function() {

        chocoEmoji.style.transform =
          'scale(1) rotate(0deg)';

      }, 250);

      if (stage < stages.length) {

        showStage();

      } else {

        $('chocoStage').style.display = 'none';

        toyArea.style.display = 'block';

        setFeedback(
          'You found the surprise toy! 🎁❤️'
        );

      }

    };

    toyButton.onclick = function() {

      const toys = [
        {
          emoji: '🐰',
          name: 'Cute Bunny',
          text: 'The bunny says: “Someone thinks you are adorable.” 🥰'
        },
        {
          emoji: '🦄',
          name: 'Love Unicorn',
          text: 'The unicorn says: “Your smile is magical.” ✨'
        },
        {
          emoji: '🐻',
          name: 'Teddy Bear',
          text: 'The teddy says: “Sending you the biggest virtual hug!” 🤗'
        },
        {
          emoji: '🐼',
          name: 'Love Panda',
          text: 'The panda says: “You are my favourite person.” ❤️'
        }
      ];

      const toy =
        toys[Math.floor(Math.random() * toys.length)];

      toyEmoji.textContent = toy.emoji;
      toyName.textContent = toy.name;
      toyText.textContent = toy.text;

      toyEmoji.style.transform =
        'scale(1.25) rotate(10deg)';

      setTimeout(function() {

        toyEmoji.style.transform =
          'scale(1) rotate(0deg)';

      }, 350);

      toyButton.textContent =
        'Play Again 🎮';

      if (!toyButton.dataset.completed) {

        toyButton.dataset.completed = 'yes';

        setTimeout(function() {

          toyText.innerHTML =
            toy.text +
            '<br><br><b>And now... the next surprise is waiting. 💕</b>';

          toyButton.textContent =
            'Continue to Love Puzzle 🧩';

          toyButton.onclick = function() {
            game3();
          };

        }, 700);

      }

    };

    showStage();
  }


  /*
  ============================================================
  GAME 3 - LOVE PUZZLE
  ============================================================
  */

  function game3() {

  currentGame = 3;

  let level = 1;
  let sequence = [];
  let playerSequence = [];
  let showingSequence = false;
  let gameFinished = false;

  const symbols = [
    "❤️",
    "💕",
    "💗",
    "💖",
    "💝",
    "🌸",
    "✨",
    "🌹"
  ];

  area.innerHTML = `

    <div class="subheading">
      Game 3 of 6 · Love Memory Challenge 💕
    </div>

    <p>
      Watch the symbols carefully and remember their exact order.
      Then tap them in the same order. ❤️
    </p>

    <div class="center">

      <div class="tiny-label">
        LEVEL <span id="memoryLevel">1</span> / 5
      </div>

      <h2 id="memoryTitle">
        Remember My Heart ❤️
      </h2>

      <p id="memoryInstruction"
         class="muted">
        Get ready...
      </p>

      <div id="memoryBoard"
        style="
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:12px;
          max-width:500px;
          margin:25px auto;
        ">
      </div>

      <div id="memoryStatus"
        style="
          min-height:55px;
          margin:15px auto;
          font-weight:bold;
          font-size:17px;
        ">
      </div>

      <button
        id="memoryStart"
        class="btn btn-primary">
        Start Level 1 💕
      </button>

    </div>
  `;

  const board = $("memoryBoard");
  const levelText = $("memoryLevel");
  const title = $("memoryTitle");
  const instruction = $("memoryInstruction");
  const status = $("memoryStatus");
  const startButton = $("memoryStart");

  function getSequenceLength() {

    return level + 2;

  }

  function createBoard() {

    board.innerHTML = "";

    for (let i = 0; i < 16; i++) {

      const button =
        document.createElement("button");

      button.type = "button";

      button.textContent = "💌";

      button.dataset.index = i;

      button.style.cssText = `
        height:75px;
        border:none;
        border-radius:18px;
        background:rgba(255,255,255,.15);
        font-size:30px;
        cursor:pointer;
        transition:
          transform .2s,
          background .2s;
      `;

      button.onclick = function() {

        if (
          showingSequence ||
          gameFinished
        ) {
          return;
        }

        checkPlayerMove(i, button);

      };

      board.appendChild(button);
    }
  }

  function createSequence() {

    sequence = [];

    const length =
      getSequenceLength();

    while (sequence.length < length) {

      const randomIndex =
        Math.floor(
          Math.random() * 16
        );

      if (!sequence.includes(randomIndex)) {
        sequence.push(randomIndex);
      }

    }
  }

  function showSequence() {

    showingSequence = true;

    playerSequence = [];

    instruction.textContent =
      "Watch carefully... 👀❤️";

    status.textContent =
      "Remember the order!";

    const buttons =
      board.querySelectorAll("button");

    let position = 0;

    const interval =
      setInterval(function() {

        if (position > 0) {

          const previous =
            buttons[
              sequence[position - 1]
            ];

          previous.textContent =
            "💌";

          previous.style.background =
            "rgba(255,255,255,.15)";

          previous.style.transform =
            "scale(1)";
        }

        if (
          position >= sequence.length
        ) {

          clearInterval(interval);

          const last =
            buttons[
              sequence[
                sequence.length - 1
              ]
            ];

          last.textContent =
            "💌";

          last.style.background =
            "rgba(255,255,255,.15)";

          last.style.transform =
            "scale(1)";

          setTimeout(function() {

            showingSequence = false;

            instruction.textContent =
              "Now repeat the exact order! 💕";

            status.textContent =
              "Your turn...";

          }, 500);

          return;
        }

        const current =
          buttons[
            sequence[position]
          ];

        current.textContent =
          symbols[
            position % symbols.length
          ];

        current.style.background =
          "rgba(255,120,180,.45)";

        current.style.transform =
          "scale(1.15)";

        position++;

      }, 750);
  }

  function checkPlayerMove(
    index,
    button
  ) {

    const expected =
      sequence[playerSequence.length];

    if (index === expected) {

      playerSequence.push(index);

      button.textContent =
        symbols[
          playerSequence.length - 1
        ];

      button.style.background =
        "rgba(120,220,160,.4)";

      button.style.transform =
        "scale(1.08)";

      status.textContent =
        "Correct! 💕 " +
        playerSequence.length +
        " / " +
        sequence.length;

      if (
        playerSequence.length ===
        sequence.length
      ) {

        levelComplete();

      }

    } else {

      button.style.background =
        "rgba(255,80,100,.45)";

      button.textContent =
        "💔";

      status.textContent =
        "Oops! Wrong order. Try this level again. 😄";

      setFeedback(
        "Almost! Watch the sequence carefully. ❤️"
      );

      setTimeout(function() {

        startLevel();

      }, 1200);
    }
  }

  function levelComplete() {

    showingSequence = true;

    status.innerHTML =
      "💖 Perfect! You remembered everything!";

    setFeedback(
      "Level " + level + " completed! 💕"
    );

    if (level >= 5) {

      finishGame();

      return;
    }

    level++;

    levelText.textContent =
      level;

    setTimeout(function() {

      startButton.style.display =
        "inline-block";

      startButton.textContent =
        "Start Level " +
        level +
        " 💕";

      instruction.textContent =
        "The next level will be harder...";

      status.textContent =
        "Ready for Level " +
        level +
        "? 😏";

      showingSequence = false;

    }, 1200);
  }

  function startLevel() {

    if (gameFinished) {
      return;
    }

    showingSequence = true;

    playerSequence = [];

    createBoard();

    createSequence();

    instruction.textContent =
      "Get ready... 👀";

    status.textContent =
      "Level " +
      level +
      " · " +
      getSequenceLength() +
      " symbols";

    startButton.style.display =
      "none";

    setTimeout(function() {

      showSequence();

    }, 700);
  }

  function finishGame() {

    gameFinished = true;

    board.innerHTML = `

      <div style="
        grid-column:1 / -1;
        padding:25px;
        text-align:center;
      ">

        <div style="
          font-size:75px;
          margin-bottom:15px;
        ">
          💖
        </div>

        <div style="
          font-size:25px;
          font-weight:bold;
        ">
          All 5 Levels Complete!
        </div>

        <div style="
          margin-top:15px;
          font-size:17px;
          line-height:1.6;
        ">
          You remembered every little piece
          of my heart. ❤️
          <br><br>

          <b>
            Maybe you know my heart
            better than you think. 💕
          </b>
        </div>

      </div>

    `;

    instruction.textContent =
      "Memory Master unlocked! 🏆";

    status.innerHTML =
      "🌸 5 / 5 Levels Completed 🌸";

    startButton.style.display =
      "none";

    setFeedback(
      "You completed all 5 memory levels! 💖"
    );

    setTimeout(function() {

      game4();

    }, 3000);
  }

  startButton.onclick = function() {

    startLevel();

  };

  createBoard();

  instruction.textContent =
    "Click Start when you're ready.";

  status.textContent =
    "Level 1 has 3 symbols.";

}

  /*
  ============================================================
  GAME 4 - WORD SORTING
  ============================================================
  */

  function game4() {

    currentGame = 4;

    area.innerHTML = `

      <div class="subheading">
        Game 4 of 6 · Sort My Words 🔤💕
      </div>

      <p>
        The words are mixed up.
        Click them in the correct order to build the hidden love message.
      </p>

      <div class="center">

        <div id="wordBank"
          style="
            display:flex;
            justify-content:center;
            flex-wrap:wrap;
            gap:10px;
            max-width:650px;
            margin:25px auto;
          ">
        </div>

        <div
          style="
            margin:20px auto;
            padding:18px;
            min-height:55px;
            max-width:650px;
            border-radius:18px;
            background:rgba(255,255,255,.12);
            font-size:20px;
            font-weight:bold;
          "
          id="sortedWords">
          Your sentence will appear here...
        </div>

        <button
          id="wordReset"
          class="btn">
          Reset Words 🔄
        </button>

      </div>
    `;

    const sentences = [
      [
        'You',
        'make',
        'my',
        'world',
        'brighter',
        'every',
        'day'
      ],
      [
        'My',
        'favorite',
        'place',
        'is',
        'beside',
        'you'
      ],
      [
        'I',
        'choose',
        'you',
        'today',
        'tomorrow',
        'and',
        'always'
      ]
    ];

    let round = 0;
    let selectedWords = [];

    function shuffle(array) {

      const copy = array.slice();

      for (let i = copy.length - 1; i > 0; i--) {

        const j =
          Math.floor(Math.random() * (i + 1));

        const temp = copy[i];

        copy[i] = copy[j];
        copy[j] = temp;
      }

      return copy;
    }

    function drawWords() {

      const bank = $('wordBank');

      bank.innerHTML = '';

      selectedWords = [];

      $('sortedWords').textContent =
        'Your sentence will appear here...';

      const words =
        shuffle(sentences[round]);

      words.forEach(function(word) {

        const button =
          document.createElement('button');

        button.type = 'button';

        button.textContent = word;

        button.className = 'btn';

        button.style.margin = '3px';

        button.onclick = function() {

          if (
            selectedWords.includes(word)
          ) {
            return;
          }

          selectedWords.push(word);

          button.style.opacity = '0.35';
          button.disabled = true;

          $('sortedWords').textContent =
            selectedWords.join(' ');

          if (
            selectedWords.length ===
            sentences[round].length
          ) {

            checkSentence();
          }

        };

        bank.appendChild(button);

      });

    }

    function checkSentence() {

      const answer =
        sentences[round].join(' ');

      const userAnswer =
        selectedWords.join(' ');

      if (userAnswer === answer) {

        setFeedback(
          'Perfect sentence! 💕'
        );

        round++;

        if (round >= sentences.length) {

          $('sortedWords').innerHTML =
            'You sorted every word perfectly! ❤️<br><br>' +
            '<b>Maybe your heart knows the right order better than your brain.</b>';

          setTimeout(function() {
            game5();
          }, 1800);

        } else {

          setTimeout(function() {
            drawWords();
          }, 900);

        }

      } else {

        setFeedback(
          'Almost! The words are in the wrong order. Try again. 😄'
        );

        setTimeout(function() {
          drawWords();
        }, 700);

      }

    }

    $('wordReset').onclick = function() {
      drawWords();
    };

    drawWords();
  }


  /*
  ============================================================
  GAME 5 - LOVE MCQs
  ============================================================
  */

  function game5() {

    currentGame = 5;

    area.innerHTML = `

      <div class="subheading">
        Game 5 of 6 · Love IQ Challenge 💕
      </div>

      <p>
        No wrong answers... except the answers that don't match
        this game's secret romantic logic. 😂❤️
      </p>

      <div class="center">

        <div class="tiny-label">
          QUESTION <span id="loveQNumber">1</span> / 6
        </div>

        <h2 id="loveQuestion"
          style="
            max-width:650px;
            margin:20px auto;
          ">
        </h2>

        <div id="loveOptions"
          style="
            display:flex;
            flex-direction:column;
            gap:12px;
            max-width:600px;
            margin:25px auto;
          ">
        </div>

        <div id="loveAnswerMessage"
          style="
            min-height:60px;
            font-weight:bold;
            margin-top:15px;
          ">
        </div>

      </div>
    `;

    const questions = [
      {
        q: 'If I suddenly text you “I miss you” at midnight, what should you reply? 🌙',
        options: [
          'Go to sleep 😂',
          'I miss you too ❤️',
          'Who are you? 😭',
          'Seen 😌'
        ],
        answer: 1
      },

      {
        q: 'What is the most dangerous thing in a relationship? 😏',
        options: [
          'Forgetting their favorite food',
          'Saying “I am fine” when they are NOT fine 😂',
          'Watching anime',
          'Sleeping early'
        ],
        answer: 1
      },

      {
        q: 'If we are watching a movie and I fall asleep on your shoulder, what should you do? 🥰',
        options: [
          'Wake me up',
          'Move away',
          'Let me sleep and smile quietly ❤️',
          'Take a picture and laugh'
        ],
        answer: 2
      },

      {
        q: 'What is the correct answer when your girlfriend asks: “Do I look cute?” 💕',
        options: [
          'Maybe',
          'Sometimes',
          'Of course you do ❤️',
          'Let me think'
        ],
        answer: 2
      },

      {
        q: 'If you could choose one superpower for our relationship, what would be best? ✨',
        options: [
          'Never run out of conversations',
          'Always find each other',
          'Pause time during happy moments',
          'All of these ❤️'
        ],
        answer: 3
      },

      {
        q: 'Final question: Who should get the bigger piece of my heart? ❤️',
        options: [
          'Me',
          'You',
          'Both equally',
          'You already have all of it 💖'
        ],
        answer: 3
      }
    ];

    let qIndex = 0;

    function showQuestion() {

      if (qIndex >= questions.length) {

        game6();
        return;
      }

      const q =
        questions[qIndex];

      $('loveQNumber').textContent =
        qIndex + 1;

      $('loveQuestion').textContent =
        q.q;

      $('loveAnswerMessage').textContent =
        '';

      const options =
        $('loveOptions');

      options.innerHTML = '';

      q.options.forEach(function(option, index) {

        const button =
          document.createElement('button');

        button.type = 'button';

        button.className =
          'btn';

        button.textContent =
          option;

        button.style.cssText += `
          padding:14px 18px;
          font-size:16px;
          text-align:left;
        `;

        button.onclick = function() {

          const allButtons =
            options.querySelectorAll('button');

          allButtons.forEach(function(btn) {
            btn.disabled = true;
          });

          if (index === q.answer) {

            $('loveAnswerMessage').innerHTML =
              '💖 Correct! That answer has earned you another heart point.';

            setFeedback(
              'That was the right answer! ❤️'
            );

          } else {

            $('loveAnswerMessage').innerHTML =
              '😂 Interesting answer... but my heart says try that question again!';

            setFeedback(
              'Not quite! Try this one again. 💕'
            );

            setTimeout(function() {

              allButtons.forEach(function(btn) {
                btn.disabled = false;
              });

            }, 900);

            return;
          }

          qIndex++;

          setTimeout(function() {
            showQuestion();
          }, 1100);

        };

        options.appendChild(button);

      });

    }

    showQuestion();
  }


  /*
  ============================================================
  GAME 6 - LOVE GARDEN
  ============================================================
  */

  function game6() {

    currentGame = 6;

    let drops = 0;
    let flowerStage = 0;
    let gameFinished = false;

    area.innerHTML = `

      <div class="subheading">
        Game 6 of 6 · Grow Our Little Love Garden 🌸
      </div>

      <p>
        This one is different.
        Collect the little love drops and help a tiny flower bloom.
        🌱❤️
      </p>

      <div class="center">

        <div
          style="
            max-width:650px;
            margin:20px auto;
            padding:25px;
            border-radius:30px;
            background:
              linear-gradient(
                180deg,
                rgba(170,220,255,.20),
                rgba(120,200,140,.25)
              );
            position:relative;
            overflow:hidden;
          "
          id="gardenArea">

          <div
            style="
              font-size:80px;
              min-height:120px;
              display:flex;
              align-items:center;
              justify-content:center;
              transition:transform .5s;
            "
            id="flower">
            🌱
          </div>

          <div
            style="
              font-size:18px;
              font-weight:bold;
              margin:15px;
            "
            id="gardenMessage">
            Our little flower is waiting for some love...
          </div>

          <div
            style="
              height:15px;
              background:rgba(255,255,255,.3);
              border-radius:20px;
              overflow:hidden;
              max-width:400px;
              margin:15px auto;
            "
          >

            <div
              id="flowerProgress"
              style="
                width:0%;
                height:100%;
                border-radius:20px;
                background:currentColor;
                transition:width .4s;
              ">
            </div>

          </div>

          <div
            style="
              font-weight:bold;
              margin:10px;
            "
          >
            💧 Love Drops:
            <span id="dropCount">0</span> / 12
          </div>

          <div
            id="loveDrops"
            style="
              position:relative;
              height:170px;
              margin-top:15px;
            ">
          </div>

        </div>

      </div>
    `;

    const garden =
      $('loveDrops');

    const flower =
      $('flower');

    const message =
      $('gardenMessage');

    const progress =
      $('flowerProgress');

    const dropCount =
      $('dropCount');

    const messages = [
      'A tiny bit of love... 💕',
      'It is starting to grow... 🌱',
      'Someone is taking very good care of it. 🥰',
      'The flower can feel your love. ❤️',
      'Almost there... 🌷',
      'It is becoming beautiful! ✨',
      'Our little garden is glowing. 💗',
      'One more little bit of love... 💕',
      'Look how much it has grown! 🌸',
      'Your love is magic. ✨',
      'Almost completely bloomed... 🌺',
      'You did it! ❤️'
    ];

    function createDrop() {

      if (gameFinished) {
        return;
      }

      const drop =
        document.createElement('button');

      drop.type = 'button';

      drop.textContent =
        drops % 2 === 0
          ? '💧'
          : '💕';

      drop.setAttribute(
        'aria-label',
        'Collect love drop'
      );

      drop.style.cssText = `
        position:absolute;
        border:none;
        background:transparent;
        font-size:32px;
        cursor:pointer;
        left:${10 + Math.random() * 80}%;
        top:${10 + Math.random() * 75}%;
        transition:transform .2s, opacity .2s;
      `;

      drop.onclick = function() {

        if (gameFinished) {
          return;
        }

        drops++;

        dropCount.textContent =
          drops;

        progress.style.width =
          ((drops / 12) * 100) + '%';

        message.textContent =
          messages[drops - 1];

        drop.style.transform =
          'scale(1.7)';

        drop.style.opacity =
          '0';

        setTimeout(function() {

          if (drop.parentNode) {
            drop.parentNode.removeChild(drop);
          }

        }, 180);

        updateFlower();

        if (drops < 12) {
          createDrop();
        }

      };

      garden.appendChild(drop);
    }

    function updateFlower() {

      if (drops <= 2) {

        flower.textContent = '🌱';
        flower.style.transform =
          'scale(1)';

      } else if (drops <= 5) {

        flower.textContent = '🌿';
        flower.style.transform =
          'scale(1.1)';

      } else if (drops <= 8) {

        flower.textContent = '🌷';
        flower.style.transform =
          'scale(1.2)';

      } else if (drops <= 11) {

        flower.textContent = '🌺';
        flower.style.transform =
          'scale(1.3)';

      } else {

        finishGarden();
      }

    }

    function finishGarden() {

      if (gameFinished) {
        return;
      }

      gameFinished = true;

      garden.innerHTML = '';

      flower.textContent =
        '💐';

      flower.style.transform =
        'scale(1.5)';

      message.innerHTML = `
        <div style="font-size:22px;">
          Our little love garden is blooming. 💐❤️
        </div>

        <div style="
          margin-top:15px;
          line-height:1.7;
          font-size:16px;
        ">
          You gave it 12 little drops of love...
          <br>
          and somehow it became something beautiful.
          <br><br>

          <b>
            Just like us. 💕
          </b>
        </div>
      `;

      setFeedback(
        'You grew the Love Garden! 🌸❤️'
      );

      setTimeout(function() {

        completeDay(4);

      }, 3500);
    }

    /*
      Start with three drops.
      New ones appear as she collects them.
    */

    createDrop();
    createDrop();
    createDrop();

  }


  /*
  ============================================================
  START DAY 4
  ============================================================
  */

  game1();
}
function shootArrow() {
  if (state.birthdayHits >= 10) return;

  const heart = $('targetHeart');

  if (!heart) {
    console.error('targetHeart was not found');
    return;
  }

  /* Create the flying arrow */
  const arrow = document.createElement('div');

  arrow.textContent = '🏹';
  arrow.style.position = 'fixed';
  arrow.style.zIndex = '99999';
  arrow.style.fontSize = '45px';
  arrow.style.pointerEvents = 'none';
  arrow.style.left = '50%';
  arrow.style.top = '75%';
  arrow.style.transform = 'translate(-50%, -50%) rotate(-15deg)';
  arrow.style.transition =
    'left 0.7s ease-in, top 0.7s ease-in, transform 0.7s ease-in, opacity 0.15s';
  arrow.style.opacity = '1';

  document.body.appendChild(arrow);

  /* Find the exact position of the heart */
  const heartRect = heart.getBoundingClientRect();

  const targetX =
    heartRect.left + (heartRect.width / 2);

  const targetY =
    heartRect.top + (heartRect.height / 2);

  /* Let the browser render the starting position first */
  requestAnimationFrame(function () {

    arrow.style.left = targetX + 'px';
    arrow.style.top = targetY + 'px';
    arrow.style.transform =
      'translate(-50%, -50%) rotate(-15deg) scale(0.8)';
  });

  /* Arrow reaches the heart */
  setTimeout(function () {

    /* Heart hit animation */
    heart.classList.remove('hit');

    void heart.offsetWidth;

    heart.classList.add('hit');

    /* Count the successful hit */
    state.birthdayHits++;

    $('hitCount').textContent =
      state.birthdayHits;

    $('heartMeterFill').style.width =
      (state.birthdayHits * 10) + '%';

    const msgs = [
      'A tiny arrow of affection! ❤️',
      'Cupid is taking notes. 💘',
      'That heart is getting softer. 💕',
      'Bullseye, sweetheart! 🎯',
      'A direct hit from your love. ❤️',
      'Six arrows, six reasons to smile. 💖',
      'That heart knows who it belongs to. 🥰',
      'Nearly there, birthday girl! 🌹',
      'One more little love tap. 💘',
      'All broken open… and full of love! 🧡'
    ];

    $('arrowMessage').textContent =
      msgs[state.birthdayHits - 1];

    /* Remove arrow */
    arrow.style.opacity = '0';

    setTimeout(function () {
      if (arrow.parentNode) {
        arrow.parentNode.removeChild(arrow);
      }
    }, 200);

    /* Complete the 10-arrow streak */
    if (state.birthdayHits >= 10) {

      state.birthdayDone = true;

      state.completed = [
        true,
        true,
        true,
        true,
        true
      ];

      state.revealed = [
        true,
        true,
        true,
        true
      ];

      saveState();

      renderBirthday();
      renderJourney();
      renderPhotoGrid();

      toast(
        '🧡 5/5 streak complete — happy birthday, my love!'
      );

    } else {

      saveState();

    }

  }, 700);
}  function openVideo(){const d=$('videoDialog');$('videoFrame').src=`https://drive.google.com/file/d/${VIDEO_ID}/preview`;if(typeof d.showModal==='function')d.showModal();else window.open(`https://drive.google.com/file/d/${VIDEO_ID}/view?usp=sharing`,'_blank','noopener')}
  function closeVideo(){$('videoFrame').src='about:blank';$('videoDialog').close()}
  // Original synthesized romantic soundscape: browsers may require one tap before audible playback.
  function startMusic(){if(!musicOn)return;try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();if(musicTimer)clearInterval(musicTimer);const patterns=[[261.63,329.63,392,329.63],[293.66,369.99,440,369.99],[220,261.63,329.63,392],[246.94,311.13,369.99,311.13],[261.63,329.63,392,523.25]];let step=0;function note(freq,dur,when){const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,when);gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(.045,when+.05);gain.gain.exponentialRampToValueAtTime(.0001,when+dur);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(when);osc.stop(when+dur+.03)}musicTimer=setInterval(()=>{if(!musicOn||!audioCtx)return;const p=patterns[(currentDay-1)%patterns.length],now=audioCtx.currentTime;note(p[step%p.length],.85,now);if(step%2===0)note(p[(step+2)%p.length]/2,1.3,now);step++},900)}catch(e){/* sound is optional */}}
  function toggleMusic(){musicOn=!musicOn;state.musicOn=musicOn;saveState();$('soundLabel').textContent=musicOn?'Music on':'Music off';if(musicOn){startMusic();if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();toast('Music is on 🎶')}else{if(musicTimer)clearInterval(musicTimer);if(audioCtx)audioCtx.suspend();toast('Music paused')}}
  init();
})();
