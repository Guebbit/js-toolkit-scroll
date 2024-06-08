/**
 * Get content of Iframe
 *
 * @param iframe
 */
export default (iframe :HTMLElement | HTMLIFrameElement | null) :HTMLElement | HTMLBodyElement | null => {
	if(!iframe || iframe.tagName !== 'IFRAME')
		return null;
	if(!(iframe as HTMLIFrameElement).contentWindow)
		return null;
	return (iframe as HTMLIFrameElement).contentWindow!.document.body;
}
