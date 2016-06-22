export var config: any = {
    "auth": {
        "callbackUrl" : "https://tasks.aiesec.org.eg/signin",
        "implicitGrantUrl": "https://auth.aiesec.org.eg/index.php?action=authorize&redirect_uri=__callbackUrl__&response_type=token&client_id=__clientId__&scope=__scopes__",
        "userInfoUrl": "https://auth.aiesec.org.eg/index.php?action=current_person",
        "clientId": "tasks-frontend",
        "scopes": "",
    },
    "API_BASE": "https://api.aiesec.org.eg/"
};