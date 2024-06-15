export interface scrollclassSettingsMap {
    class: string;
    scroll: number;
    remove?: boolean;
}
/**
*	Classi che aggiungo (o rimuovo) ad un certo scrollY
* @param {HTMLElement[]} element 	= l'elemento a cui applicare le classi a seconda della posizione
*	@param {Array} data				= array di oggetti
*	@param {Window} $window
    [{
        class: "test",		//a 400px aggiungo la classe test
        scroll: 400,
        remove: true		//se remove=true (false di default), invece la rimuovo
    }]
**/
declare const _default: (element: HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, data: scrollclassSettingsMap[], $window?: Window) => void;
export default _default;
//# sourceMappingURL=scrollclass.d.ts.map