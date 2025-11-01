const dylib = Deno.dlopen(
    "./lib/openssl_check.so",
    {
        "check_dec_prime": {
            parameters: ["pointer"],
            result: "i32",
        },
    } as const,
);
/**
 * Checks whether prime using the OpenSSL C library.
 * @param maybe_prime
 * @returns boolean
 */
export function isPrime(maybe_prime: number | bigint): boolean {
    const cString = new TextEncoder().encode(maybe_prime.toString() + "\0");
    const result: number = dylib.symbols.check_dec_prime(
        Deno.UnsafePointer.of(cString),
    );
    // console.log(`Checking primality for ${maybe_prime}...`);
    // console.log(`C function returned: ${result}`);
    if (result === 1) {
        return true;
    }
    if (result === 0) {
        return false;
    }
    throw new Error(`Unexpected result (${result}) from C function`);
}
