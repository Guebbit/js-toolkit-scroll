/**
 *  Trasformo un array normale in un FormData
 *  Necessario per il passaggio di file o per evitare l'uso di php:\\input
 *  WARNING formData appiattisce tutti gli array multidimensionali,
 *  quindi è meglio trasformarli in un json.
 *  JSON.stringify(); prima e poi json_decode($_POST['']); nel php
 *
 *  @param object obj = oggetto da convertire
 *  @param FormData RECURSIVO  form = l'oggetto convertito
 *  @param string RECURSIVO  namespace = ??
 */
declare const toFormData: (obj: Record<string, unknown>, form?: FormData | null, namespace?: string | null) => FormData;
export default toFormData;
//# sourceMappingURL=toFormData.d.ts.map