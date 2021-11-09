export default (
  color
) => `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
<mask id="a" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20" fill="#000">
<path fill="#fff" d="M0 0h20v20H0z"/><path d="M12.746 7.405a.27.27 0 0 0-.382 0L7.62 12.149a.27.27 0 1 0 .382.382l4.744-4.745a.268.268 0 0 0 .058-.294.268.268 0 0 0-.058-.087ZM8.635 9.73a1.31 1.31 0 1 0-.002-2.621 1.31 1.31 0 0 0 .002 2.62Zm-.546-1.856a.771.771 0 1 1 1.091 1.09.771.771 0 0 1-1.09-1.09Zm10.62.972c-.238-.228-.484-.463-.529-.662-.048-.212.074-.54.193-.857.168-.453.343-.92.149-1.323-.198-.409-.678-.565-1.142-.716-.318-.103-.646-.21-.778-.374-.131-.165-.164-.512-.195-.846-.046-.484-.092-.985-.445-1.267-.353-.283-.848-.216-1.329-.15-.334.043-.68.09-.874-.004-.187-.09-.363-.385-.533-.67-.252-.42-.513-.855-.96-.957-.432-.098-.845.175-1.247.439-.285.19-.58.382-.803.382-.223 0-.518-.192-.804-.381-.401-.264-.816-.536-1.248-.439-.447.102-.708.537-.96.957-.17.285-.346.58-.533.67-.194.093-.54.047-.874.003-.48-.064-.978-.13-1.329.15-.35.28-.397.783-.442 1.267-.03.334-.062.679-.195.845-.133.167-.46.271-.778.375-.464.15-.944.307-1.142.716-.194.402-.02.87.15 1.322.118.318.24.645.192.858-.045.199-.291.434-.529.662C1.368 9.186 1 9.538 1 10c0 .463.368.815.724 1.155.238.228.484.463.53.662.047.212-.075.54-.193.857-.17.453-.344.921-.15 1.323.198.409.678.565 1.141.716.318.103.646.21.778.375.13.164.164.511.195.845.044.484.09.985.443 1.267.353.281.848.214 1.33.15.333-.044.679-.09.873.003.187.09.363.385.533.67.252.42.513.855.96.957.06.013.121.02.183.02.366 0 .72-.233 1.064-.459.285-.187.58-.381.803-.381.223 0 .518.194.804.381.401.264.816.536 1.247.439.447-.102.707-.537.96-.957.17-.285.346-.58.533-.67.194-.093.54-.047.874-.003.48.064.978.13 1.329-.15.35-.28.399-.783.443-1.267.03-.334.062-.68.195-.845.133-.167.46-.272.778-.375.464-.15.945-.307 1.142-.716.194-.402.02-.87-.15-1.323-.118-.317-.24-.645-.192-.857.046-.199.291-.434.53-.662.357-.34.725-.692.725-1.155 0-.462-.368-.814-.724-1.154h.001Zm-.373 1.92c-.296.282-.601.575-.682.931-.085.37.067.775.212 1.167.13.346.264.704.17.9-.098.201-.467.32-.823.437-.393.128-.8.26-1.033.551-.232.29-.273.72-.31 1.133-.035.372-.07.756-.243.894s-.553.086-.922.036c-.413-.055-.84-.111-1.179.052-.332.16-.55.525-.762.878-.194.324-.394.658-.616.708-.207.048-.524-.161-.83-.363-.352-.23-.716-.47-1.1-.47-.385 0-.75.24-1.1.47-.308.202-.625.41-.832.363-.221-.05-.422-.384-.615-.708-.212-.353-.43-.717-.763-.878a1.269 1.269 0 0 0-.556-.108 4.818 4.818 0 0 0-.623.056c-.369.05-.75.1-.921-.036-.172-.135-.208-.524-.244-.895-.036-.412-.077-.84-.311-1.132-.234-.29-.64-.425-1.033-.553-.356-.115-.725-.235-.823-.437-.093-.194.04-.552.17-.9.144-.391.297-.796.212-1.166-.08-.357-.386-.648-.682-.932-.274-.26-.557-.532-.557-.764 0-.231.283-.504.557-.764.296-.283.601-.576.684-.932.084-.37-.067-.775-.213-1.167-.13-.346-.263-.704-.169-.9.097-.2.468-.32.823-.437.393-.128.8-.26 1.033-.55.232-.292.273-.72.309-1.133.036-.371.07-.756.242-.894.173-.138.553-.086.922-.036.413.055.84.111 1.179-.052.332-.16.55-.525.762-.878.194-.324.394-.658.616-.708.207-.047.524.161.83.363.352.231.716.47 1.1.47.385 0 .75-.239 1.101-.47.307-.202.624-.41.83-.363.223.05.423.385.616.708.212.353.43.717.763.878.34.163.766.108 1.179.052.369-.049.75-.1.921.036.172.136.209.523.243.894.037.413.077.84.31 1.133.235.293.64.423 1.033.551.357.116.726.236.823.437.094.195-.04.553-.169.9-.146.392-.297.797-.213 1.167.081.357.387.648.682.932.274.26.558.532.558.763 0 .232-.284.504-.558.765h.002Zm-8.12-7.204A6.446 6.446 0 0 0 3.777 10a6.446 6.446 0 0 0 6.439 6.439A6.446 6.446 0 0 0 16.654 10a6.446 6.446 0 0 0-6.438-6.438Zm0 12.337A5.905 5.905 0 0 1 4.317 10a5.905 5.905 0 0 1 5.899-5.898A5.905 5.905 0 0 1 16.114 10a5.905 5.905 0 0 1-5.898 5.899Zm.654-5.244a1.311 1.311 0 1 0 1.854 1.854 1.311 1.311 0 0 0-1.854-1.854Zm1.472 1.472a.77.77 0 1 1-1.09-1.09.77.77 0 0 1 1.09 1.09Z"/></mask><path d="M12.746 7.405a.27.27 0 0 0-.382 0L7.62 12.149a.27.27 0 1 0 .382.382l4.744-4.745a.268.268 0 0 0 .058-.294.268.268 0 0 0-.058-.087ZM8.635 9.73a1.31 1.31 0 1 0-.002-2.621 1.31 1.31 0 0 0 .002 2.62Zm-.546-1.856a.771.771 0 1 1 1.091 1.09.771.771 0 0 1-1.09-1.09Zm10.62.972c-.238-.228-.484-.463-.529-.662-.048-.212.074-.54.193-.857.168-.453.343-.92.149-1.323-.198-.409-.678-.565-1.142-.716-.318-.103-.646-.21-.778-.374-.131-.165-.164-.512-.195-.846-.046-.484-.092-.985-.445-1.267-.353-.283-.848-.216-1.329-.15-.334.043-.68.09-.874-.004-.187-.09-.363-.385-.533-.67-.252-.42-.513-.855-.96-.957-.432-.098-.845.175-1.247.439-.285.19-.58.382-.803.382-.223 0-.518-.192-.804-.381-.401-.264-.816-.536-1.248-.439-.447.102-.708.537-.96.957-.17.285-.346.58-.533.67-.194.093-.54.047-.874.003-.48-.064-.978-.13-1.329.15-.35.28-.397.783-.442 1.267-.03.334-.062.679-.195.845-.133.167-.46.271-.778.375-.464.15-.944.307-1.142.716-.194.402-.02.87.15 1.322.118.318.24.645.192.858-.045.199-.291.434-.529.662C1.368 9.186 1 9.538 1 10c0 .463.368.815.724 1.155.238.228.484.463.53.662.047.212-.075.54-.193.857-.17.453-.344.921-.15 1.323.198.409.678.565 1.141.716.318.103.646.21.778.375.13.164.164.511.195.845.044.484.09.985.443 1.267.353.281.848.214 1.33.15.333-.044.679-.09.873.003.187.09.363.385.533.67.252.42.513.855.96.957.06.013.121.02.183.02.366 0 .72-.233 1.064-.459.285-.187.58-.381.803-.381.223 0 .518.194.804.381.401.264.816.536 1.247.439.447-.102.707-.537.96-.957.17-.285.346-.58.533-.67.194-.093.54-.047.874-.003.48.064.978.13 1.329-.15.35-.28.399-.783.443-1.267.03-.334.062-.68.195-.845.133-.167.46-.272.778-.375.464-.15.945-.307 1.142-.716.194-.402.02-.87-.15-1.323-.118-.317-.24-.645-.192-.857.046-.199.291-.434.53-.662.357-.34.725-.692.725-1.155 0-.462-.368-.814-.724-1.154h.001Zm-.373 1.92c-.296.282-.601.575-.682.931-.085.37.067.775.212 1.167.13.346.264.704.17.9-.098.201-.467.32-.823.437-.393.128-.8.26-1.033.551-.232.29-.273.72-.31 1.133-.035.372-.07.756-.243.894s-.553.086-.922.036c-.413-.055-.84-.111-1.179.052-.332.16-.55.525-.762.878-.194.324-.394.658-.616.708-.207.048-.524-.161-.83-.363-.352-.23-.716-.47-1.1-.47-.385 0-.75.24-1.1.47-.308.202-.625.41-.832.363-.221-.05-.422-.384-.615-.708-.212-.353-.43-.717-.763-.878a1.269 1.269 0 0 0-.556-.108 4.818 4.818 0 0 0-.623.056c-.369.05-.75.1-.921-.036-.172-.135-.208-.524-.244-.895-.036-.412-.077-.84-.311-1.132-.234-.29-.64-.425-1.033-.553-.356-.115-.725-.235-.823-.437-.093-.194.04-.552.17-.9.144-.391.297-.796.212-1.166-.08-.357-.386-.648-.682-.932-.274-.26-.557-.532-.557-.764 0-.231.283-.504.557-.764.296-.283.601-.576.684-.932.084-.37-.067-.775-.213-1.167-.13-.346-.263-.704-.169-.9.097-.2.468-.32.823-.437.393-.128.8-.26 1.033-.55.232-.292.273-.72.309-1.133.036-.371.07-.756.242-.894.173-.138.553-.086.922-.036.413.055.84.111 1.179-.052.332-.16.55-.525.762-.878.194-.324.394-.658.616-.708.207-.047.524.161.83.363.352.231.716.47 1.1.47.385 0 .75-.239 1.101-.47.307-.202.624-.41.83-.363.223.05.423.385.616.708.212.353.43.717.763.878.34.163.766.108 1.179.052.369-.049.75-.1.921.036.172.136.209.523.243.894.037.413.077.84.31 1.133.235.293.64.423 1.033.551.357.116.726.236.823.437.094.195-.04.553-.169.9-.146.392-.297.797-.213 1.167.081.357.387.648.682.932.274.26.558.532.558.763 0 .232-.284.504-.558.765h.002Zm-8.12-7.204A6.446 6.446 0 0 0 3.777 10a6.446 6.446 0 0 0 6.439 6.439A6.446 6.446 0 0 0 16.654 10a6.446 6.446 0 0 0-6.438-6.438Zm0 12.337A5.905 5.905 0 0 1 4.317 10a5.905 5.905 0 0 1 5.899-5.898A5.905 5.905 0 0 1 16.114 10a5.905 5.905 0 0 1-5.898 5.899Zm.654-5.244a1.311 1.311 0 1 0 1.854 1.854 1.311 1.311 0 0 0-1.854-1.854Zm1.472 1.472a.77.77 0 1 1-1.09-1.09.77.77 0 0 1 1.09 1.09Z" fill="${color}"/>
<path d="M12.746 7.405a.27.27 0 0 0-.382 0L7.62 12.149a.27.27 0 1 0 .382.382l4.744-4.745a.268.268 0 0 0 .058-.294.268.268 0 0 0-.058-.087ZM8.635 9.73a1.31 1.31 0 1 0-.002-2.621 1.31 1.31 0 0 0 .002 2.62Zm-.546-1.856a.771.771 0 1 1 1.091 1.09.771.771 0 0 1-1.09-1.09Zm10.62.972c-.238-.228-.484-.463-.529-.662-.048-.212.074-.54.193-.857.168-.453.343-.92.149-1.323-.198-.409-.678-.565-1.142-.716-.318-.103-.646-.21-.778-.374-.131-.165-.164-.512-.195-.846-.046-.484-.092-.985-.445-1.267-.353-.283-.848-.216-1.329-.15-.334.043-.68.09-.874-.004-.187-.09-.363-.385-.533-.67-.252-.42-.513-.855-.96-.957-.432-.098-.845.175-1.247.439-.285.19-.58.382-.803.382-.223 0-.518-.192-.804-.381-.401-.264-.816-.536-1.248-.439-.447.102-.708.537-.96.957-.17.285-.346.58-.533.67-.194.093-.54.047-.874.003-.48-.064-.978-.13-1.329.15-.35.28-.397.783-.442 1.267-.03.334-.062.679-.195.845-.133.167-.46.271-.778.375-.464.15-.944.307-1.142.716-.194.402-.02.87.15 1.322.118.318.24.645.192.858-.045.199-.291.434-.529.662C1.368 9.186 1 9.538 1 10c0 .463.368.815.724 1.155.238.228.484.463.53.662.047.212-.075.54-.193.857-.17.453-.344.921-.15 1.323.198.409.678.565 1.141.716.318.103.646.21.778.375.13.164.164.511.195.845.044.484.09.985.443 1.267.353.281.848.214 1.33.15.333-.044.679-.09.873.003.187.09.363.385.533.67.252.42.513.855.96.957.06.013.121.02.183.02.366 0 .72-.233 1.064-.459.285-.187.58-.381.803-.381.223 0 .518.194.804.381.401.264.816.536 1.247.439.447-.102.707-.537.96-.957.17-.285.346-.58.533-.67.194-.093.54-.047.874-.003.48.064.978.13 1.329-.15.35-.28.399-.783.443-1.267.03-.334.062-.68.195-.845.133-.167.46-.272.778-.375.464-.15.945-.307 1.142-.716.194-.402.02-.87-.15-1.323-.118-.317-.24-.645-.192-.857.046-.199.291-.434.53-.662.357-.34.725-.692.725-1.155 0-.462-.368-.814-.724-1.154h.001Zm-.373 1.92c-.296.282-.601.575-.682.931-.085.37.067.775.212 1.167.13.346.264.704.17.9-.098.201-.467.32-.823.437-.393.128-.8.26-1.033.551-.232.29-.273.72-.31 1.133-.035.372-.07.756-.243.894s-.553.086-.922.036c-.413-.055-.84-.111-1.179.052-.332.16-.55.525-.762.878-.194.324-.394.658-.616.708-.207.048-.524-.161-.83-.363-.352-.23-.716-.47-1.1-.47-.385 0-.75.24-1.1.47-.308.202-.625.41-.832.363-.221-.05-.422-.384-.615-.708-.212-.353-.43-.717-.763-.878a1.269 1.269 0 0 0-.556-.108 4.818 4.818 0 0 0-.623.056c-.369.05-.75.1-.921-.036-.172-.135-.208-.524-.244-.895-.036-.412-.077-.84-.311-1.132-.234-.29-.64-.425-1.033-.553-.356-.115-.725-.235-.823-.437-.093-.194.04-.552.17-.9.144-.391.297-.796.212-1.166-.08-.357-.386-.648-.682-.932-.274-.26-.557-.532-.557-.764 0-.231.283-.504.557-.764.296-.283.601-.576.684-.932.084-.37-.067-.775-.213-1.167-.13-.346-.263-.704-.169-.9.097-.2.468-.32.823-.437.393-.128.8-.26 1.033-.55.232-.292.273-.72.309-1.133.036-.371.07-.756.242-.894.173-.138.553-.086.922-.036.413.055.84.111 1.179-.052.332-.16.55-.525.762-.878.194-.324.394-.658.616-.708.207-.047.524.161.83.363.352.231.716.47 1.1.47.385 0 .75-.239 1.101-.47.307-.202.624-.41.83-.363.223.05.423.385.616.708.212.353.43.717.763.878.34.163.766.108 1.179.052.369-.049.75-.1.921.036.172.136.209.523.243.894.037.413.077.84.31 1.133.235.293.64.423 1.033.551.357.116.726.236.823.437.094.195-.04.553-.169.9-.146.392-.297.797-.213 1.167.081.357.387.648.682.932.274.26.558.532.558.763 0 .232-.284.504-.558.765h.002Zm-8.12-7.204A6.446 6.446 0 0 0 3.777 10a6.446 6.446 0 0 0 6.439 6.439A6.446 6.446 0 0 0 16.654 10a6.446 6.446 0 0 0-6.438-6.438Zm0 12.337A5.905 5.905 0 0 1 4.317 10a5.905 5.905 0 0 1 5.899-5.898A5.905 5.905 0 0 1 16.114 10a5.905 5.905 0 0 1-5.898 5.899Zm.654-5.244a1.311 1.311 0 1 0 1.854 1.854 1.311 1.311 0 0 0-1.854-1.854Zm1.472 1.472a.77.77 0 1 1-1.09-1.09.77.77 0 0 1 1.09 1.09Z" stroke="${color}" stroke-width=".4" mask="url(#a)"/></svg>`;