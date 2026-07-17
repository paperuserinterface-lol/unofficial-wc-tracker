// Moments Page Logic
// A historical archive of iconic, short World Cup moments, plus
// "Recreate The Moment" mini-games that let users replay a few of them.

const CATEGORY_LABELS = {
    goal: { icon: '⚽', label: 'Iconic Goal' },
    save: { icon: '🧤', label: 'Iconic Save' },
    emotion: { icon: '❤️', label: 'Iconic Scene' }
};

// Pitch coordinates below are normalized 0..1.
// x: 0 = own half touchline, 1 = attacking goal line.
// y: 0 = top touchline, 1 = bottom touchline. Goal mouth is centered at y = 0.5.
const MOMENTS = [
    {
        id: 'maradona-1986',
        year: 1986,
        minute: "60'",
        category: 'goal',
        title: "Maradona's Goal of the Century",
        match: 'Argentina vs England · Quarterfinal',
        description: 'Picking the ball up in his own half, Diego Maradona glides past five England players before slotting a cool finish into the corner.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.12, y: 0.55 },
                { x: 0.34, y: 0.42 },
                { x: 0.52, y: 0.5 },
                { x: 0.68, y: 0.47 }
            ],
            shooterStart: { x: 0.7, y: 0.47 },
            keeperPos: { x: 0.95, y: 0.56 },
            defenders: [
                { x: 0.22, y: 0.48 },
                { x: 0.4, y: 0.6 },
                { x: 0.48, y: 0.36 },
                { x: 0.58, y: 0.58 },
                { x: 0.66, y: 0.34 }
            ],
            targetY: 0.4,
            perfectTol: 0.05,
            closeTol: 0.14,
            keeperReach: 0.09
        }
    },
    {
        id: 'iniesta-2010',
        year: 2010,
        minute: "116'",
        category: 'goal',
        title: "Iniesta's Final Winner",
        match: 'Spain vs Netherlands · Final',
        description: 'Deep into extra time, Andrés Iniesta meets a low cross with a perfectly controlled volley to win Spain their first World Cup.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.2, y: 0.72 },
                { x: 0.45, y: 0.6 },
                { x: 0.62, y: 0.45 }
            ],
            shooterStart: { x: 0.64, y: 0.45 },
            keeperPos: { x: 0.95, y: 0.42 },
            defenders: [
                { x: 0.5, y: 0.3 },
                { x: 0.58, y: 0.68 }
            ],
            targetY: 0.62,
            perfectTol: 0.05,
            closeTol: 0.15,
            keeperReach: 0.1
        }
    },
    {
        id: 'gotze-2014',
        year: 2014,
        minute: "113'",
        category: 'goal',
        title: "Götze's Golden Strike",
        match: 'Germany vs Argentina · Final',
        description: 'Substitute Mario Götze chests down André Schürrle’s cross and volleys home the only goal of the final.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.18, y: 0.3 },
                { x: 0.4, y: 0.35 },
                { x: 0.6, y: 0.5 },
                { x: 0.7, y: 0.52 }
            ],
            shooterStart: { x: 0.72, y: 0.52 },
            keeperPos: { x: 0.95, y: 0.5 },
            defenders: [
                { x: 0.45, y: 0.22 },
                { x: 0.55, y: 0.7 }
            ],
            targetY: 0.36,
            perfectTol: 0.05,
            closeTol: 0.14,
            keeperReach: 0.09
        }
    },
    {
        id: 'rodriguez-2014',
        year: 2014,
        minute: "39'",
        category: 'goal',
        title: "James Rodríguez's Volley",
        match: 'Colombia vs Uruguay · Round of 16',
        description: 'A dropping ball is met with a perfectly timed chest control and an unstoppable first-time volley into the top corner.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.25, y: 0.62 },
                { x: 0.45, y: 0.5 },
                { x: 0.6, y: 0.5 }
            ],
            shooterStart: { x: 0.62, y: 0.5 },
            keeperPos: { x: 0.95, y: 0.52 },
            defenders: [
                { x: 0.4, y: 0.34 },
                { x: 0.5, y: 0.7 }
            ],
            targetY: 0.34,
            perfectTol: 0.05,
            closeTol: 0.13,
            keeperReach: 0.08
        }
    },
    {
        id: 'carlos-alberto-1970',
        year: 1970,
        minute: "86'",
        category: 'goal',
        title: "Carlos Alberto's Team Goal",
        match: 'Brazil vs Italy · Final',
        description: 'A flowing move involving almost the entire team ends with captain Carlos Alberto thundering a first-time strike into the corner, often called the greatest team goal ever scored.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.1, y: 0.5 },
                { x: 0.3, y: 0.62 },
                { x: 0.48, y: 0.7 },
                { x: 0.6, y: 0.58 }
            ],
            shooterStart: { x: 0.62, y: 0.56 },
            keeperPos: { x: 0.95, y: 0.44 },
            defenders: [
                { x: 0.42, y: 0.4 },
                { x: 0.56, y: 0.34 }
            ],
            targetY: 0.64,
            perfectTol: 0.05,
            closeTol: 0.14,
            keeperReach: 0.09
        }
    },
    {
        id: 'zidane-1998',
        year: 1998,
        minute: "27'",
        category: 'goal',
        title: "Zidane's Final Header",
        match: 'France vs Brazil · Final',
        description: 'Zinedine Zidane rises highest from a corner to power a header into the net, the first of two near-identical goals that hand France their first World Cup.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.94, y: 0.06 },
                { x: 0.82, y: 0.28 },
                { x: 0.74, y: 0.42 }
            ],
            shooterStart: { x: 0.74, y: 0.42 },
            keeperPos: { x: 0.95, y: 0.5 },
            defenders: [
                { x: 0.7, y: 0.3 },
                { x: 0.68, y: 0.55 }
            ],
            targetY: 0.4,
            perfectTol: 0.05,
            closeTol: 0.13,
            keeperReach: 0.08
        }
    },
    {
        id: 'ronaldinho-2002',
        year: 2002,
        minute: "50'",
        category: 'goal',
        title: "Ronaldinho's Long-Range Free Kick",
        match: 'Brazil vs England · Quarterfinal',
        description: 'From nearly 40 yards, Ronaldinho curls a free kick that loops over a stranded David Seaman and drops just inside the far post, still debated as either luck or genius.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.38, y: 0.52 }
            ],
            shooterStart: { x: 0.4, y: 0.5 },
            keeperPos: { x: 0.97, y: 0.5 },
            defenders: [
                { x: 0.55, y: 0.42 },
                { x: 0.55, y: 0.5 },
                { x: 0.55, y: 0.58 }
            ],
            targetY: 0.32,
            perfectTol: 0.05,
            closeTol: 0.13,
            keeperReach: 0.07
        }
    },
    {
        id: 'pele-1958',
        year: 1958,
        minute: "90'",
        category: 'goal',
        title: "Pelé's Chip Volley",
        match: 'Brazil vs Sweden · Final',
        description: "17-year-old Pelé chests down a cross with his back to goal, flicks it over a defender, and volleys home before the ball even touches the ground.",
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.15, y: 0.3 },
                { x: 0.35, y: 0.42 },
                { x: 0.5, y: 0.5 }
            ],
            shooterStart: { x: 0.52, y: 0.5 },
            keeperPos: { x: 0.95, y: 0.46 },
            defenders: [
                { x: 0.45, y: 0.42 }
            ],
            targetY: 0.42,
            perfectTol: 0.05,
            closeTol: 0.13,
            keeperReach: 0.08
        }
    },
    {
        id: 'rivaldo-2002',
        year: 2002,
        minute: "87'",
        category: 'goal',
        title: "Rivaldo's Bicycle Kick",
        match: 'Brazil vs Belgium · Round of 16',
        description: 'Rivaldo controls a cross on his chest, lets it drop, and connects with an overhead bicycle kick that flies into the corner.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.3, y: 0.35 },
                { x: 0.5, y: 0.4 },
                { x: 0.6, y: 0.48 }
            ],
            shooterStart: { x: 0.6, y: 0.48 },
            keeperPos: { x: 0.95, y: 0.5 },
            defenders: [
                { x: 0.55, y: 0.36 }
            ],
            targetY: 0.36,
            perfectTol: 0.05,
            closeTol: 0.13,
            keeperReach: 0.08
        }
    },
    {
        id: 'bergkamp-1998',
        year: 1998,
        minute: "90'",
        category: 'goal',
        title: "Bergkamp's Winning Touch",
        match: 'Netherlands vs Argentina · Quarterfinal',
        description: 'Dennis Bergkamp controls a long diagonal pass with one touch, wrong-foots the defender with a second, and slots home the winner in the dying minutes.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.15, y: 0.6 },
                { x: 0.55, y: 0.5 }
            ],
            shooterStart: { x: 0.62, y: 0.52 },
            keeperPos: { x: 0.95, y: 0.46 },
            defenders: [
                { x: 0.58, y: 0.4 }
            ],
            targetY: 0.42,
            perfectTol: 0.05,
            closeTol: 0.13,
            keeperReach: 0.08
        }
    },
    {
        id: 'maxi-rodriguez-2006',
        year: 2006,
        minute: "98'",
        category: 'goal',
        title: "Maxi Rodríguez's Extra-Time Volley",
        match: 'Argentina vs Mexico · Round of 16',
        description: 'A long diagonal ball drops perfectly for Maxi Rodríguez, who meets it first-time on the volley from outside the box to win it in extra time.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.12, y: 0.68 },
                { x: 0.45, y: 0.55 },
                { x: 0.58, y: 0.5 }
            ],
            shooterStart: { x: 0.58, y: 0.5 },
            keeperPos: { x: 0.95, y: 0.52 },
            defenders: [
                { x: 0.5, y: 0.62 }
            ],
            targetY: 0.36,
            perfectTol: 0.05,
            closeTol: 0.14,
            keeperReach: 0.09
        }
    },
    {
        id: 'carli-lloyd-2015',
        year: 2015,
        minute: "16'",
        category: 'goal',
        title: "Carli Lloyd's Halfway-Line Strike",
        match: "USA vs Japan · Women's World Cup Final",
        description: 'Spotting the goalkeeper off her line, Carli Lloyd strikes a shot from just past the halfway line that drops into the net, completing a hat-trick inside 16 minutes.',
        recreate: {
            type: 'goal',
            buildUp: [
                { x: 0.08, y: 0.5 },
                { x: 0.14, y: 0.5 }
            ],
            shooterStart: { x: 0.16, y: 0.5 },
            keeperPos: { x: 0.9, y: 0.62 },
            defenders: [],
            targetY: 0.4,
            perfectTol: 0.06,
            closeTol: 0.18,
            keeperReach: 0.06
        }
    },
    {
        id: 'banks-1970',
        year: 1970,
        minute: "10'",
        category: 'save',
        title: "Gordon Banks' Save of the Century",
        match: 'England vs Brazil · Group Stage',
        description: "Pelé's downward header looks a certain goal until Gordon Banks somehow twists and claws it over the bar.",
        recreate: {
            type: 'save',
            buildUp: [
                { x: 0.3, y: 0.4 },
                { x: 0.5, y: 0.45 },
                { x: 0.66, y: 0.42 }
            ],
            shooterStart: { x: 0.66, y: 0.42 },
            defenders: [
                { x: 0.58, y: 0.62 }
            ],
            targetY: 0.35,
            perfectTol: 0.05,
            closeTol: 0.15
        }
    },
    {
        id: 'suarez-2010',
        year: 2010,
        minute: "120+1'",
        category: 'save',
        title: "Suárez's Handball on the Line",
        match: 'Uruguay vs Ghana · Quarterfinal',
        description: 'With the goal gaping, Luis Suárez punches the header off the line, sacrificing himself to keep Uruguay alive.',
        recreate: {
            type: 'save',
            buildUp: [
                { x: 0.35, y: 0.6 },
                { x: 0.55, y: 0.55 },
                { x: 0.7, y: 0.58 }
            ],
            shooterStart: { x: 0.7, y: 0.58 },
            defenders: [
                { x: 0.82, y: 0.44 }
            ],
            targetY: 0.6,
            perfectTol: 0.05,
            closeTol: 0.15
        }
    },
    {
        id: 'casillas-2010',
        year: 2010,
        minute: "116'",
        category: 'save',
        title: "Casillas Denies Robben",
        match: 'Netherlands vs Spain · Final',
        description: 'Arjen Robben breaks clean through in extra time, but Iker Casillas rushes off his line and produces a sprawling save with the outstretched boot to keep Spain alive.',
        recreate: {
            type: 'save',
            buildUp: [
                { x: 0.38, y: 0.5 },
                { x: 0.56, y: 0.48 }
            ],
            shooterStart: { x: 0.62, y: 0.47 },
            defenders: [],
            targetY: 0.4,
            perfectTol: 0.05,
            closeTol: 0.15
        }
    },
    {
        id: 'martinez-2022',
        year: 2022,
        minute: "90+1'",
        category: 'save',
        title: 'Martínez Denies Kolo Muani',
        match: 'Argentina vs France · Final',
        description: 'With the last kick of normal time, Randal Kolo Muani races clear through the middle, but Emiliano Martínez stretches out a boot to deny a certain winner.',
        recreate: {
            type: 'save',
            buildUp: [
                { x: 0.35, y: 0.55 },
                { x: 0.55, y: 0.5 },
                { x: 0.68, y: 0.48 }
            ],
            shooterStart: { x: 0.68, y: 0.48 },
            defenders: [
                { x: 0.5, y: 0.62 }
            ],
            targetY: 0.55,
            perfectTol: 0.05,
            closeTol: 0.15
        }
    },
    {
        id: 'neuer-2014',
        year: 2014,
        minute: "70'",
        category: 'save',
        title: "Neuer's Sweeper-Keeper Tackle",
        match: 'Germany vs Algeria · Round of 16',
        description: "Racing far outside his box, Manuel Neuer slides in to intercept Algeria's counter-attack before the striker can even shoot, redefining the modern goalkeeper role.",
        recreate: {
            type: 'save',
            buildUp: [
                { x: 0.35, y: 0.55 },
                { x: 0.55, y: 0.5 }
            ],
            shooterStart: { x: 0.68, y: 0.48 },
            defenders: [],
            targetY: 0.5,
            perfectTol: 0.05,
            closeTol: 0.15
        }
    },
    {
        id: 'ochoa-2014',
        year: 2014,
        minute: "45'",
        category: 'save',
        title: "Ochoa's Wall",
        match: 'Mexico vs Brazil · Group Stage',
        description: 'Guillermo Ochoa produces save after save to deny Brazil at home, including a stunning reflex stop that keeps Mexico level.',
        recreate: {
            type: 'save',
            buildUp: [
                { x: 0.3, y: 0.42 },
                { x: 0.5, y: 0.46 },
                { x: 0.66, y: 0.44 }
            ],
            shooterStart: { x: 0.66, y: 0.44 },
            defenders: [
                { x: 0.58, y: 0.6 }
            ],
            targetY: 0.34,
            perfectTol: 0.05,
            closeTol: 0.15
        }
    },
    {
        id: 'zidane-2006',
        year: 2006,
        minute: "110'",
        category: 'emotion',
        title: "Zidane's Final Bow",
        match: 'France vs Italy · Final',
        description: 'In his final professional match, Zinedine Zidane reacts to Marco Materazzi and is sent off with a red card, an unforgettable exit.',
        recreate: null
    },
    {
        id: 'tardelli-1982',
        year: 1982,
        minute: "69'",
        category: 'emotion',
        title: "Tardelli's Scream",
        match: 'Italy vs West Germany · Final',
        description: "Marco Tardelli's raw, tear-filled roar after scoring in the final becomes one of football's most iconic celebrations.",
        recreate: null
    },
    {
        id: 'milla-1990',
        year: 1990,
        minute: "76'",
        category: 'emotion',
        title: "Roger Milla's Corner Flag Dance",
        match: 'Cameroon vs Romania · Group Stage',
        description: '38-year-old Roger Milla wheels away after scoring to dance by the corner flag, a celebration that defines his World Cup legacy.',
        recreate: null
    },
    {
        id: 'hand-of-god-1986',
        year: 1986,
        minute: "51'",
        category: 'emotion',
        title: 'The Hand of God',
        match: 'Argentina vs England · Quarterfinal',
        description: 'Diego Maradona rises above goalkeeper Peter Shilton and punches the ball into the net with his fist, a controversial incident that still divides football fans decades later.',
        recreate: null
    },
    {
        id: 'bebeto-1994',
        year: 1994,
        minute: "72'",
        category: 'emotion',
        title: "Bebeto's Baby Rock",
        match: 'Brazil vs Netherlands · Quarterfinal',
        description: 'After scoring, Bebeto is joined by Romário and Mazinho in cradling their arms like a rocking cradle, a celebration for his newborn son that became instantly iconic.',
        recreate: null
    },
    {
        id: 'messi-trophy-2022',
        year: 2022,
        minute: 'Full Time',
        category: 'emotion',
        title: 'Messi Lifts the World Cup',
        match: 'Argentina vs France · Final',
        description: "Draped in a traditional bisht, Lionel Messi lifts the World Cup trophy after Argentina's dramatic penalty shootout win, completing football's greatest individual story.",
        recreate: null
    },
    {
        id: 'baggio-1994',
        year: 1994,
        minute: 'Penalties',
        category: 'emotion',
        title: "Baggio's Missed Penalty",
        match: 'Brazil vs Italy · Final',
        description: "With the World Cup on the line, Roberto Baggio skies his penalty over the bar, sealing Brazil's triumph and creating one of football's most heartbreaking images.",
        recreate: null
    },
    {
        id: 'schillaci-1990',
        year: 1990,
        minute: "18'",
        category: 'emotion',
        title: "Schillaci's Wide-Eyed Roar",
        match: 'Italy vs Austria · Group Stage',
        description: "After scoring, Salvatore Schillaci wheels away with his eyes bulging in pure euphoria, an image that becomes the defining photo of Italia '90.",
        recreate: null
    },
    {
        id: 'maracanazo-1950',
        year: 1950,
        minute: "79'",
        category: 'emotion',
        title: 'The Maracanazó Silence',
        match: 'Uruguay vs Brazil · Final',
        description: 'With Brazil needing only a draw in front of nearly 200,000 fans at the Maracanã, Uruguay’s late winner plunges the stadium into a stunned, historic silence.',
        recreate: null
    },
    {
        id: 'gyan-2010',
        year: 2010,
        minute: "120+2'",
        category: 'emotion',
        title: "Gyan's Crossbar Heartbreak",
        match: 'Ghana vs Uruguay · Quarterfinal',
        description: "Moments after Luis Suárez's goal-line handball, Asamoah Gyan strikes the resulting penalty against the crossbar, sending the shootout — and Ghana's dream — into cruel suspense.",
        recreate: null
    }
];

const MOMENTS_BEST_SCORES_KEY = 'worldCupMomentsBestScores';

let momentsPageInitialized = false;
let currentMomentFilter = 'all';
let activeMoment = null;
let momentGameRafId = null;
let momentGameState = null;
let momentGameCanvas = null;
let momentGameCtx = null;
let momentGamePointerActive = false;

// ---------- Persistence ----------

function getBestScores() {
    try {
        return JSON.parse(localStorage.getItem(MOMENTS_BEST_SCORES_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveBestScore(momentId, points) {
    const scores = getBestScores();
    if (!scores[momentId] || points > scores[momentId]) {
        scores[momentId] = points;
        localStorage.setItem(MOMENTS_BEST_SCORES_KEY, JSON.stringify(scores));
    }
}

function getBestScoreLabel(momentId) {
    const scores = getBestScores();
    const points = scores[momentId];
    if (points === undefined) return null;
    if (points >= 100) return { label: 'Perfect', points };
    if (points >= 50) return { label: 'Close', points };
    return { label: 'Attempted', points };
}

// ---------- Archive rendering ----------

function renderMoments(filter) {
    currentMomentFilter = filter || currentMomentFilter;
    const container = document.getElementById('moments-container');
    if (!container) return;

    const filtered = currentMomentFilter === 'all'
        ? MOMENTS
        : MOMENTS.filter(moment => moment.category === currentMomentFilter);

    container.innerHTML = filtered.map(moment => {
        const categoryInfo = CATEGORY_LABELS[moment.category];
        const best = getBestScoreLabel(moment.id);

        return `
            <article class="moment-card">
                <div class="moment-topline">
                    <span class="moment-minute">${moment.year} · ${moment.minute}</span>
                    <span class="moment-tag">${categoryInfo.icon} ${categoryInfo.label}</span>
                </div>
                <h3 class="moment-title">${moment.title}</h3>
                <div class="moment-match">${moment.match}</div>
                <p class="moment-description">${moment.description}</p>
                ${moment.recreate ? `
                    <div class="moment-card-footer">
                        <button class="btn btn-primary moment-recreate-btn" data-moment-id="${moment.id}">Recreate The Moment</button>
                        ${best ? `<span class="moment-best-score">Best: ${best.label}</span>` : ''}
                    </div>
                ` : `
                    <div class="moment-card-footer">
                        <span class="moment-archive-note">Preserved in World Cup history</span>
                    </div>
                `}
            </article>
        `;
    }).join('');

    container.querySelectorAll('.moment-recreate-btn').forEach(btn => {
        btn.addEventListener('click', () => openRecreateModal(btn.dataset.momentId));
    });
}

function attachMomentFilterHandlers() {
    document.querySelectorAll('.moment-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.moment-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderMoments(tab.dataset.momentFilter);
        });
    });
}

// ---------- Mini-game engine ----------

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function getRecreateColors(type) {
    // 'goal' moments: the user's team (teal) passes it to the shooter, opponents (red) defend/keep goal.
    // 'save' moments: the opposing team (orange) builds the attack, the user's side (teal) defends/dives.
    return type === 'save'
        ? { attack: 'rgba(255, 112, 67, 0.95)', defend: 'rgba(38, 166, 154, 0.95)' }
        : { attack: 'rgba(38, 166, 154, 0.95)', defend: 'rgba(244, 67, 54, 0.9)' };
}

function getPointerPos(evt) {
    const rect = momentGameCanvas.getBoundingClientRect();
    const touch = evt.touches && evt.touches[0];
    const clientX = touch ? touch.clientX : evt.clientX;
    const clientY = touch ? touch.clientY : evt.clientY;
    const scaleX = momentGameCanvas.width / rect.width;
    const scaleY = momentGameCanvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX / momentGameCanvas.width,
        y: (clientY - rect.top) * scaleY / momentGameCanvas.height
    };
}

function resetGameState(moment) {
    const recreate = moment.recreate;
    const path = [...recreate.buildUp, recreate.shooterStart || recreate.buildUp[recreate.buildUp.length - 1]];

    momentGameState = {
        moment,
        recreate,
        phase: 'buildup',
        path,
        segmentIndex: 0,
        segmentStart: performance.now(),
        segmentDuration: 600,
        ballPos: { ...path[0] },
        ballTrail: [],
        receivePulses: [],
        aimCurrent: null,
        diveY: null,
        shotStart: null,
        shotElapsed: 0,
        shotDuration: 1100,
        result: null
    };
}

function setInstructions(text) {
    const el = document.getElementById('moment-game-instructions');
    if (el) el.textContent = text;
}

function setResultPanel(html) {
    const el = document.getElementById('moment-game-result');
    if (el) el.innerHTML = html;
}

function drawPitch(ctx) {
    const w = momentGameCanvas.width;
    const h = momentGameCanvas.height;

    ctx.fillStyle = '#0f3d2e';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Goal frame on the right edge
    const postTop = h * 0.32;
    const postBottom = h * 0.68;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w - 6, postTop);
    ctx.lineTo(w - 6, postBottom);
    ctx.stroke();

    // Six-yard box approximation
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(w - 90, h * 0.25, 84, h * 0.5);
}

function drawCircle(ctx, pos, radius, color) {
    const w = momentGameCanvas.width;
    const h = momentGameCanvas.height;
    ctx.beginPath();
    ctx.arc(pos.x * w, pos.y * h, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawRing(ctx, pos, radius, color) {
    const w = momentGameCanvas.width;
    const h = momentGameCanvas.height;
    ctx.beginPath();
    ctx.arc(pos.x * w, pos.y * h, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawLabel(ctx, pos, text, color) {
    const w = momentGameCanvas.width;
    const h = momentGameCanvas.height;
    ctx.fillStyle = color;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, pos.x * w, pos.y * h - 18);
}

function pushBallTrail(state) {
    state.ballTrail.push({ ...state.ballPos });
    if (state.ballTrail.length > 8) {
        state.ballTrail.shift();
    }
}

function drawFrame() {
    const ctx = momentGameCtx;
    const state = momentGameState;
    drawPitch(ctx);

    if (!state) return;

    const recreate = state.recreate;
    const colors = getRecreateColors(recreate.type);

    // Defenders/markers being played past (decorative context for the build-up)
    (recreate.defenders || []).forEach(pos => {
        drawCircle(ctx, pos, 10, colors.defend);
    });

    // The passing sequence: every teammate who touches the ball on the way to the shooter
    state.path.forEach((pos, index) => {
        const isShooter = index === state.path.length - 1;
        const radius = isShooter && state.phase !== 'buildup' ? 12 : 10;
        drawCircle(ctx, pos, radius, colors.attack);

        if (isShooter && state.phase !== 'buildup') {
            drawLabel(ctx, pos, 'YOU', '#ffffff');
        }
    });

    // A brief glowing ring each time a pass is received
    const now = performance.now();
    state.receivePulses = state.receivePulses.filter(pulse => now - pulse.time < 450);
    state.receivePulses.forEach(pulse => {
        const age = (now - pulse.time) / 450;
        drawRing(ctx, pulse.pos, 10 + age * 14, `rgba(255,255,255,${0.6 * (1 - age)})`);
    });

    // Keeper (for goal-type recreations)
    if (recreate.keeperPos) {
        drawCircle(ctx, recreate.keeperPos, 14, colors.defend);
    }

    // Dive marker for save-type recreations
    if (recreate.type === 'save' && state.phase !== 'buildup') {
        const diveMarkerPos = { x: 0.97, y: state.diveY !== null ? state.diveY : 0.5 };
        drawCircle(ctx, diveMarkerPos, 14, '#ffc107');
        if (state.diveY === null) {
            drawLabel(ctx, diveMarkerPos, 'YOU', '#0a0e17');
        }
    }

    // Fading trail behind the ball
    state.ballTrail.forEach((pos, index) => {
        const ratio = (index + 1) / state.ballTrail.length;
        drawCircle(ctx, pos, 6 * ratio, `rgba(255,255,255,${0.35 * ratio})`);
    });

    // Aim line while aiming a shot
    if (state.phase === 'aim' && state.aimCurrent) {
        const w = momentGameCanvas.width;
        const h = momentGameCanvas.height;
        const origin = recreate.shooterStart;
        ctx.strokeStyle = 'rgba(255, 87, 34, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(origin.x * w, origin.y * h);
        ctx.lineTo(state.aimCurrent.x * w, state.aimCurrent.y * h);
        ctx.stroke();
    }

    // Ball
    drawCircle(ctx, state.ballPos, 8, '#ffffff');
}

function advanceBuildUp(timestamp) {
    const state = momentGameState;
    const elapsed = timestamp - state.segmentStart;
    const t = Math.min(1, elapsed / state.segmentDuration);
    const from = state.path[state.segmentIndex];
    const to = state.path[state.segmentIndex + 1];

    state.ballPos = {
        x: lerp(from.x, to.x, t),
        y: lerp(from.y, to.y, t)
    };
    pushBallTrail(state);

    if (t >= 1) {
        state.receivePulses.push({ pos: { ...to }, time: timestamp });
        state.segmentIndex += 1;
        state.segmentStart = timestamp;

        if (state.segmentIndex >= state.path.length - 1) {
            state.ballPos = { ...to };
            beginInteractivePhase();
        }
    }
}

function beginInteractivePhase() {
    const state = momentGameState;
    if (state.recreate.type === 'goal') {
        state.phase = 'aim';
        state.ballTrail = [];
        setInstructions('Nice passing move! Now click or tap and drag from the ball, then release toward the goal to shoot!');
    } else {
        state.phase = 'incoming';
        state.shotStart = performance.now();
        setInstructions('Click or tap inside the goal to dive and make the save!');
    }
}

function advanceShot(timestamp) {
    const state = momentGameState;
    const t = Math.min(1, (timestamp - state.shotStart) / state.shotDuration);
    const from = state.recreate.shooterStart;
    const targetX = 1.02;

    state.ballPos = {
        x: lerp(from.x, targetX, t),
        y: lerp(from.y, state.recreate.targetY, t)
    };
    pushBallTrail(state);

    if (t >= 1) {
        finishSaveAttempt();
    }
}

function tierFromDiff(diff, recreate) {
    if (diff <= recreate.perfectTol) return 'perfect';
    if (diff <= recreate.closeTol) return 'close';
    return 'miss';
}

function tierPoints(tier) {
    if (tier === 'perfect') return 100;
    if (tier === 'close') return 50;
    return 0;
}

function tierMessage(tier, moment) {
    if (tier === 'perfect') {
        return `Perfect recreation! That's exactly how ${moment.title.split("'")[0]} did it.`;
    }
    if (tier === 'close') {
        return 'Close! A great effort, but not quite the exact iconic strike.';
    }
    return 'Missed it this time — give it another go!';
}

function finishGoalAttempt(vector) {
    const state = momentGameState;
    const recreate = state.recreate;
    const origin = recreate.shooterStart;

    if (vector.x <= 0.01) {
        return endMomentGame('miss', 'That shot never even went toward goal!');
    }

    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    if (distance < 0.05) {
        return endMomentGame('miss', 'Too weak — the keeper collects it easily.');
    }

    const slope = vector.y / vector.x;
    const yAtGoal = origin.y + slope * (1 - origin.x);

    if (yAtGoal < 0.28 || yAtGoal > 0.72) {
        return endMomentGame('miss', 'Off target — wide of the post!');
    }

    let tier = tierFromDiff(Math.abs(yAtGoal - recreate.targetY), recreate);

    if (tier !== 'perfect' && recreate.keeperPos) {
        const keeperDiff = Math.abs(yAtGoal - recreate.keeperPos.y);
        if (keeperDiff < recreate.keeperReach) {
            tier = 'miss';
            return endMomentGame(tier, 'Saved by the keeper — so close though!');
        }
    }

    endMomentGame(tier, tierMessage(tier, state.moment));
}

function finishSaveAttempt() {
    const state = momentGameState;
    const recreate = state.recreate;

    if (state.diveY === null) {
        return endMomentGame('miss', "Too slow to react — it's in the net!");
    }

    const diff = Math.abs(state.diveY - recreate.targetY);
    const tier = tierFromDiff(diff, recreate);
    const messages = {
        perfect: 'What a save! That is exactly the right spot.',
        close: 'Got a hand to it! A partial save.',
        miss: "Dived the wrong way — it's in the net!"
    };

    endMomentGame(tier, messages[tier]);
}

function endMomentGame(tier, message) {
    const state = momentGameState;
    state.phase = 'result';
    const points = tierPoints(tier);
    saveBestScore(state.moment.id, points);

    const tierLabel = tier === 'perfect' ? 'Perfect Recreation' : tier === 'close' ? 'Close Recreation' : 'Missed Attempt';

    setInstructions('');
    setResultPanel(`
        <div class="moment-result-tier moment-result-${tier}">${tierLabel}</div>
        <p class="moment-result-message">${message}</p>
        <p class="moment-result-points">+${points} pts</p>
    `);
}

function gameTick(timestamp) {
    const state = momentGameState;
    if (!state) return;

    if (state.phase === 'buildup') {
        advanceBuildUp(timestamp);
    } else if (state.phase === 'incoming') {
        advanceShot(timestamp);
    }

    drawFrame();

    if (state.phase !== 'result') {
        momentGameRafId = requestAnimationFrame(gameTick);
    }
}

function startMomentGame(moment) {
    resetGameState(moment);
    setResultPanel('');
    setInstructions('Watch the build-up unfold...');
    if (momentGameRafId) cancelAnimationFrame(momentGameRafId);
    momentGameRafId = requestAnimationFrame(gameTick);
}

function handleCanvasPointerDown(evt) {
    const state = momentGameState;
    if (!state) return;

    const pos = getPointerPos(evt);

    if (state.phase === 'aim') {
        momentGamePointerActive = true;
        state.aimCurrent = pos;
    } else if (state.phase === 'incoming' && state.diveY === null) {
        state.diveY = pos.y;
    }
}

function handleCanvasPointerMove(evt) {
    const state = momentGameState;
    if (!state || !momentGamePointerActive || state.phase !== 'aim') return;
    state.aimCurrent = getPointerPos(evt);
}

function handleCanvasPointerUp(evt) {
    const state = momentGameState;
    if (!state || state.phase !== 'aim' || !momentGamePointerActive) return;

    momentGamePointerActive = false;
    const pos = getPointerPos(evt);
    const origin = state.recreate.shooterStart;
    const vector = { x: pos.x - origin.x, y: pos.y - origin.y };
    state.phase = 'shooting';
    finishGoalAttempt(vector);
}

function attachCanvasHandlers() {
    momentGameCanvas.addEventListener('mousedown', handleCanvasPointerDown);
    momentGameCanvas.addEventListener('mousemove', handleCanvasPointerMove);
    momentGameCanvas.addEventListener('mouseup', handleCanvasPointerUp);
    momentGameCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleCanvasPointerDown(e); }, { passive: false });
    momentGameCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleCanvasPointerMove(e); }, { passive: false });
    momentGameCanvas.addEventListener('touchend', (e) => { e.preventDefault(); handleCanvasPointerUp(e); }, { passive: false });
}

function openRecreateModal(momentId) {
    const moment = MOMENTS.find(m => m.id === momentId);
    if (!moment || !moment.recreate) return;

    activeMoment = moment;
    document.getElementById('moment-game-title').textContent = `Recreate: ${moment.title}`;
    document.getElementById('moment-game-modal').style.display = 'block';

    startMomentGame(moment);
}

function closeRecreateModal() {
    document.getElementById('moment-game-modal').style.display = 'none';
    if (momentGameRafId) {
        cancelAnimationFrame(momentGameRafId);
        momentGameRafId = null;
    }
    momentGameState = null;
    momentGamePointerActive = false;
    renderMoments(currentMomentFilter);
}

function attachMomentGameControls() {
    document.getElementById('moment-game-close').addEventListener('click', closeRecreateModal);
    document.getElementById('moment-game-close-btn').addEventListener('click', closeRecreateModal);
    document.getElementById('moment-game-retry-btn').addEventListener('click', () => {
        if (activeMoment) startMomentGame(activeMoment);
    });

    window.addEventListener('click', (e) => {
        if (e.target.id === 'moment-game-modal') {
            closeRecreateModal();
        }
    });
}

// ---------- Init ----------

function initMomentsPage() {
    renderMoments(currentMomentFilter);

    if (momentsPageInitialized) return;

    momentGameCanvas = document.getElementById('moment-game-canvas');
    momentGameCtx = momentGameCanvas.getContext('2d');

    attachMomentFilterHandlers();
    attachCanvasHandlers();
    attachMomentGameControls();

    momentsPageInitialized = true;
}
