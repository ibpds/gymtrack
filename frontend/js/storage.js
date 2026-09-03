/* ========================================
   GYMTRACK STORAGE
======================================== */

const GymTrackStorage = {

    keys: {
        workouts: "gymtrack_workouts",
        history: "gymtrack_history",
        profile: "gymtrack_profile"
    },


    /* ========================================
       UTILITÁRIOS
    ======================================== */

    get(key, fallback = []) {

        try {

            const data =
                localStorage.getItem(key);

            return data
                ? JSON.parse(data)
                : fallback;

        } catch (error) {

            console.error(
                `Erro ao ler ${key}:`,
                error
            );

            return fallback;
        }

    },


    set(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    },


    generateId() {

        if (
            typeof crypto !== "undefined" &&
            crypto.randomUUID
        ) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2)
        );

    },


    /* ========================================
       TREINOS
    ======================================== */

    getWorkouts() {

        return this.get(
            this.keys.workouts,
            []
        );

    },


    getWorkoutById(id) {

        const workouts =
            this.getWorkouts();

        return workouts.find(
            workout =>
                String(workout.id) === String(id)
        ) || null;

    },


    saveWorkout(workout) {

        const workouts =
            this.getWorkouts();


        const newWorkout = {

            ...workout,

            id:
                workout.id ||
                this.generateId(),

            criadoEm:
                workout.criadoEm ||
                new Date().toISOString(),

            atualizadoEm:
                new Date().toISOString()

        };


        workouts.push(newWorkout);

        this.set(
            this.keys.workouts,
            workouts
        );


        return newWorkout;

    },


    updateWorkout(id, data) {

        const workouts =
            this.getWorkouts();


        const index =
            workouts.findIndex(
                workout =>
                    String(workout.id) === String(id)
            );


        if (index === -1) {
            return null;
        }


        workouts[index] = {

            ...workouts[index],

            ...data,

            id: workouts[index].id,

            atualizadoEm:
                new Date().toISOString()

        };


        this.set(
            this.keys.workouts,
            workouts
        );


        return workouts[index];

    },


    deleteWorkout(id) {

        const workouts =
            this.getWorkouts();


        const updated =
            workouts.filter(
                workout =>
                    String(workout.id) !== String(id)
            );


        this.set(
            this.keys.workouts,
            updated
        );

    },


    /* ========================================
       HISTÓRICO
    ======================================== */

    getHistory() {

        return this.get(
            this.keys.history,
            []
        );

    },


    saveHistory(record) {

        const history =
            this.getHistory();


        const newRecord = {

            ...record,

            id: this.generateId(),

            realizadoEm:
                record.realizadoEm ||
                new Date().toISOString()

        };


        history.unshift(newRecord);


        this.set(
            this.keys.history,
            history
        );


        return newRecord;

    },


    /* ========================================
       PERFIL
    ======================================== */

    getProfile() {

        return this.get(
            this.keys.profile,
            null
        );

    },


    saveProfile(profile) {

        this.set(
            this.keys.profile,
            profile
        );

        return profile;

    }

};

/* ========================================
   DADOS INICIAIS
======================================== */

GymTrackStorage.seed = function () {

    const initialized =
        localStorage.getItem(
            "gymtrack_initialized"
        );


    if (initialized) {
        return;
    }


    const initialWorkouts = [

        {
            id: "treino-a",

            nome: "Pernas & Glúteos",

            descricao:
                "Foco em quadríceps, posterior e glúteos.",

            duracaoEstimada: 55,

            exercicios: [

                {
                    nome: "Agachamento",
                    series: 4,
                    repeticoes: 10,
                    carga: 40,
                    descanso: 60,
                    observacao:
                        "Controle a descida e mantenha a postura."
                },

                {
                    nome: "Leg press",
                    series: 4,
                    repeticoes: 12,
                    carga: 80,
                    descanso: 60,
                    observacao:
                        "Mantenha os pés firmes na plataforma."
                },

                {
                    nome: "Cadeira extensora",
                    series: 3,
                    repeticoes: 12,
                    carga: 35,
                    descanso: 45,
                    observacao:
                        "Evite movimentos muito rápidos."
                },

                {
                    nome: "Elevação pélvica",
                    series: 4,
                    repeticoes: 10,
                    carga: 50,
                    descanso: 60,
                    observacao:
                        "Contraia os glúteos no topo."
                },

                {
                    nome: "Mesa flexora",
                    series: 3,
                    repeticoes: 12,
                    carga: 30,
                    descanso: 45,
                    observacao: ""
                },

                {
                    nome: "Panturrilha",
                    series: 4,
                    repeticoes: 15,
                    carga: 25,
                    descanso: 45,
                    observacao: ""
                }

            ]
        },


        {
            id: "treino-b",

            nome: "Peito & Tríceps",

            descricao:
                "Treino de empurrar com foco em força.",

            duracaoEstimada: 50,

            exercicios: [

                {
                    nome: "Supino reto",
                    series: 4,
                    repeticoes: 10,
                    carga: 40,
                    descanso: 60,
                    observacao: ""
                },

                {
                    nome: "Supino inclinado",
                    series: 3,
                    repeticoes: 10,
                    carga: 30,
                    descanso: 60,
                    observacao: ""
                },

                {
                    nome: "Crucifixo",
                    series: 3,
                    repeticoes: 12,
                    carga: 12,
                    descanso: 45,
                    observacao: ""
                },

                {
                    nome: "Tríceps corda",
                    series: 3,
                    repeticoes: 12,
                    carga: 25,
                    descanso: 45,
                    observacao: ""
                },

                {
                    nome: "Tríceps francês",
                    series: 3,
                    repeticoes: 12,
                    carga: 12,
                    descanso: 45,
                    observacao: ""
                }

            ]
        },


        {
            id: "treino-c",

            nome: "Costas & Bíceps",

            descricao:
                "Foco em puxadas, remadas e bíceps.",

            duracaoEstimada: 60,

            exercicios: [

                {
                    nome: "Puxada frontal",
                    series: 4,
                    repeticoes: 10,
                    carga: 45,
                    descanso: 60,
                    observacao: ""
                },

                {
                    nome: "Remada baixa",
                    series: 4,
                    repeticoes: 10,
                    carga: 40,
                    descanso: 60,
                    observacao: ""
                },

                {
                    nome: "Remada unilateral",
                    series: 3,
                    repeticoes: 12,
                    carga: 18,
                    descanso: 45,
                    observacao: ""
                },

                {
                    nome: "Rosca direta",
                    series: 3,
                    repeticoes: 12,
                    carga: 15,
                    descanso: 45,
                    observacao: ""
                },

                {
                    nome: "Rosca martelo",
                    series: 3,
                    repeticoes: 12,
                    carga: 10,
                    descanso: 45,
                    observacao: ""
                },

                {
                    nome: "Rosca concentrada",
                    series: 3,
                    repeticoes: 10,
                    carga: 8,
                    descanso: 45,
                    observacao: ""
                }

            ]
        }

    ];


    GymTrackStorage.set(
        GymTrackStorage.keys.workouts,
        initialWorkouts
    );


    localStorage.setItem(
        "gymtrack_initialized",
        "true"
    );

};


GymTrackStorage.seed();