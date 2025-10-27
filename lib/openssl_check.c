#include <openssl/bn.h>
#include <stdio.h>
#include <stdlib.h>

/**
 * Checks if a large number, provided as a decimal string, is prime.
 *
 * @param dec_string The number to check, as a null-terminated decimal string.
 * @return 1: The number is prime.
 * 0: The number is composite (not prime).
 * -1: An error occurred (e.g., invalid input, memory allocation failure).
 */
int check_dec_prime(const char *dec_string) {
    BIGNUM *p = NULL;
    BN_CTX *ctx = NULL;
    int result = -1; // Default to error

    if (BN_dec2bn(&p, dec_string) == 0) {
        fprintf(stderr, "Error: Could not convert decimal string to BIGNUM.\n");
        goto cleanup;
    }

    ctx = BN_CTX_new();
    if (ctx == NULL) {
        fprintf(stderr, "Error: Could not allocate BN_CTX.\n");
        goto cleanup;
    }

    result = BN_check_prime(p, ctx, NULL);

cleanup:
    if (p != NULL) {
        BN_free(p);
    }
    if (ctx != NULL) {
        BN_CTX_free(ctx);
    }
    return result;
}