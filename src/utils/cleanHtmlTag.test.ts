import { describe, expect, it } from 'vitest'
import DOMPurify from 'dompurify'
import { cleanHtmlTag, removeHtmlTags } from './cleanHtmlTag'

describe('cleanHtmlTag test', () => {
  it('Should remove <script> tag', () => {
    const xss = `<p>blabla</p><script>alert('spawned')</script>`

    expect(cleanHtmlTag(DOMPurify())(xss)).equals(`<p>blabla</p>`)
  })

  it('Should remove <pre> tag', () => {
    const xss = `<p>blabla</p><pre>alert('spawned')</pre>`

    expect(cleanHtmlTag(DOMPurify())(xss)).equals(`<p>blabla</p>alert('spawned')`)
  })

  it('Should remove all tags', () => {
    const html = `<p><strong>J'ai réalisé l'implémentation LTI pour certains clients.</strong></p><p><br></p><p>La fonctionnalité que je peux implémenter :</p><p><br></p><ul><li>Connexion LTI standard : LMS -&gt; Outil LTI -&gt; Votre application</li><li>Implémentation du deeplink : LMS -&gt; outil LTI -&gt; choisissez un contenu parmi vos ressources -&gt; Afficher le deeplink sur le LMS</li><li>Service de notes et de résultats : La possibilité pour votre application d'enregistrer la note sur le LMS</li><li>Utiliser Moodle comme outil LTI (ouvrir la ressource Moodle depuis votre application) : Votre application -&gt; Outil LTI -&gt; Moodle</li></ul><p><br></p><p>Mes langages : JavaScript / TypeScript et PHP</p><p><br></p><p>Je fournis une documentation complète à tous mes clients.</p><p><br></p><p>le code livré est couvert par une garantie d'un an.</p>`

    const clean = removeHtmlTags(DOMPurify())(html)
    expect(clean).equal(
      `J'ai réalisé l'implémentation LTI pour certains clients. La fonctionnalité que je peux implémenter : Connexion LTI standard : LMS - Outil LTI - Votre applicationImplémentation du deeplink : LMS - outil LTI - choisissez un contenu parmi vos ressources - Afficher le deeplink sur le LMSService de notes et de résultats : La possibilité pour votre application d'enregistrer la note sur le LMSUtiliser Moodle comme outil LTI (ouvrir la ressource Moodle depuis votre application) : Votre application - Outil LTI - Moodle Mes langages : JavaScript / TypeScript et PHP Je fournis une documentation complète à tous mes clients. le code livré est couvert par une garantie d'un an.`
    )
  })
})
