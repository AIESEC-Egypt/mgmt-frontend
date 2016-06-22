export class MathHelper {
    static gcd(a:number, b:number) : number {
        while(true) {
            if(a == 0) return b;
            b %= a;
            if(b == 0) return a;
            a %= b;
        }
    }

    static gcd_array(factors : number[]) : number {
        var factor : number = factors[0];
        for(var i = 1; i < factors.length; i++) {
            factor = MathHelper.gcd(factor, factors[i]);
        }
        return factor;
    }
}