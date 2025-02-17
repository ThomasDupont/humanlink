import { pipeline, env, cos_sim} from "@huggingface/transformers";

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'mixedbread-ai/mxbai-embed-large-v1';
    static instance = null;

    static async getInstance() {
        return this.instance;
    }

    static init (progress_callback) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
    }
}

PipelineSingleton.init(x => {
    console.log(x)
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
    self.postMessage(x);
})

const services = [
    // ✅✅✅ Match parfait (Score 10)
    "Je détoure vos images avec Photoshop pour un rendu impeccable.",
    "Je retire l’arrière-plan de vos photos en haute qualité.",
    "Je fournis des images détourées en PNG avec fond transparent.",
  
    // ✅✅ Match fort (Score 7-8)
    "Je fais du photomontage et du détourage avancé.",
    "Je vous fournis des visuels prêts pour l’e-commerce (détourage, retouche, fond blanc).",
    "Je retouche et optimise vos images pour un rendu pro.",
  
    // ✅ Match moyen (Score 5)
    "Je conçois vos visuels marketing (bannières, flyers, posts réseaux sociaux).",
    "Je vectorise vos images pour un rendu professionnel.",
    "Je réalise des montages photo et des effets spéciaux.",
  
    // ❓ Match faible (Score 2-3)
    "Je crée des logos personnalisés et uniques.",
    "Je réalise des portraits numériques stylisés.",
    "Je fais des animations graphiques pour vos vidéos.",
    "Je réalise des illustrations sur mesure.",
  
    // ❌ Aucun match (Score 0)
    "Je rédige vos articles de blog et vos contenus web.",
    "Je compose une musique originale pour votre projet.",
    "Je programme votre site web sur WordPress.",
  
    // 🚨 Totalement hors sujet (Score 0)
    "Je cuisine vos nouilles à emporter.",
    "Je vous apprends à dresser votre chat.",
    "Je fais des imitations vocales de vos célébrités préférées.",
    "Je vous aide à méditer et à atteindre l’illumination.",
  ];

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the classification pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    const classifier = await PipelineSingleton.getInstance();
    console.log(event.data.text)

    const inputs = [
        "Je suis stressé et j'ai besoin de me détendre",
        ...services
    ]

    
    console.log(inputs)
    // Actually perform the classification
    const output = await classifier(inputs, { pooling: 'cls' });

    const [source_embeddings, ...document_embeddings ] = output.tolist();
    const similarities = document_embeddings.map(x => cos_sim(source_embeddings, x));

    //console.log(similarities)

    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: similarities,
    });
});
