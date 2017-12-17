function myMap() 
{
    let address = document.getElementById("address").getAttribute("name").split("/");
    let mapOptions = 
    {
        center: new google.maps.LatLng(address[0], address[1]),
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }

    let map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // Marker pour le premier parking
    let infop1 = document.getElementById("p1").getAttribute("name").split("/");
    let pos1 = new google.maps.LatLng(infop1[1], infop1[2]);                
    let marker1 = new google.maps.Marker(
    {
        position: pos1,
        map: map,
        title: infop1[0]
    });

    // Marker pour le second parking
    let infop2 = document.getElementById("p2").getAttribute("name").split("/");
    let pos2 = new google.maps.LatLng(infop2[1], infop2[2])
    let marker2 = new google.maps.Marker({
        position: pos2,
        map: map,
        title: infop2[0]
    });

    // Marker pour le troisième parking
    let infop3 = document.getElementById("p3").getAttribute("name").split("/");
    let pos3 = new google.maps.LatLng(infop3[1], infop3[2])
    let marker3 = new google.maps.Marker({
        position: pos3,
        map: map,
        title: infop3[0]
    });
} 