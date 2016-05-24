/* @flow */
export var Utils = {
    camelCase(s: string): string {
        return (s||'').toLowerCase().replace(/(\b|_)\w/g, function(m) {
            return m.toUpperCase().replace(/_/,' ');
        });
    },
    sanitizeId(s:string): string {
        return (s||'').toLowerCase().replace(/ /g,"_");
    }
}
