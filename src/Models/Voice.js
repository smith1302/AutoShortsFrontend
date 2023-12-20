export default class Voice {
    constructor(id, name, audioUrl) {
        this.id = id; // Should match ElevenLabs ID
        this.name = name;
        this.audioUrl = audioUrl;
    }

    static all() {
        return [
            new Voice('UbMVRhS1USNluzTy9S2e', 'Amit', 'https://storage.googleapis.com/eleven-public-prod/xcpdkIV6GoPJb4UApYRLpSFQNUO2/voices/CFSyCOekRQd36MD5JSSw/fd06514b-e047-4c1d-9ef1-0a64acf8522a.mp3'),
            new Voice('xqX80ZmOz8kaARej60o9', 'Suzanne', 'https://storage.googleapis.com/eleven-public-prod/xcpdkIV6GoPJb4UApYRLpSFQNUO2/voices/mZrq2XCSOTtxoqzNjNPt/b82090cb-0f3c-4f4a-bad7-2436c8193760.mp3'),
            new Voice('UfVl6orOzCsvxgFEQY4u', 'Hades', 'https://storage.googleapis.com/eleven-public-prod/TGwM86H7VUV1Ih5PGMZswTkL5Qd2/voices/6buUoCSgjTtLCEqFXwEc/366919c8-f824-4990-88f1-fdfe58461ca1.mp3'),
        ]
    }
}