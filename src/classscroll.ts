import { throttle } from "lodash";
import { formatNodeList } from "../../_helpers";

export interface classScrollSettingsMap {
	class :string,
	scroll :number,
	remove? :boolean,
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
export default (element :HTMLElement | HTMLElement[] | NodeList | HTMLCollection | null, data :classScrollSettingsMap[], $window :Window = window) :void => {
	const elementsArray = formatNodeList(element);
	if(elementsArray.length < 1)
		return;

	$window.addEventListener('scroll', throttle(function() :void {
		let i:number,
			k:number;
		//per ogni elemento
		for(k = elementsArray.length; k--; ){
			if(!elementsArray[k])
				continue;
			//per ogni opzione
			for(i = data.length; i--; ){
				if(!data[i])
					continue;
				const { class: classs, scroll = 0, remove = false } = data[i]!;
				//se remove non è specificato, allora è false
				if(!remove){
					//add on scrolling, oltre una certa soglia aggiungo la classe
					if($window.scrollY > scroll){
						elementsArray[k]!.classList.add(classs);
					}else{
						elementsArray[k]!.classList.remove(classs);
					}
				}else{
					//remove on scrolling, oltre una certa soglia rimuovo la classe
					if($window.scrollY > scroll){
						elementsArray[k]!.classList.remove(classs);
					}else{
						elementsArray[k]!.classList.add(classs);
					}
				}
			}
		}
	}, 50));
};
