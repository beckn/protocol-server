import _sodium, { base64_variants } from "libsodium-wrappers"
import { writeFile } from "fs/promises"
import logger from "./logger"

export const createKeyPair = async () : Promise<void> => {
    await _sodium.ready
    const sodium = _sodium
    let { publicKey, privateKey } = sodium.crypto_sign_keypair()
    const publicKey_base64 = sodium.to_base64(publicKey, base64_variants.ORIGINAL);
    const privateKey_base64 = sodium.to_base64(privateKey, base64_variants.ORIGINAL);
    await writeFile('./publicKey.pem', publicKey_base64)
    await writeFile('./privateKey.pem', privateKey_base64)
}

const createSigningString = async (message : object)  => {
    try {
        const created = Math.floor(new Date().getTime() / 1000).toString()
        const expires = ( parseInt(created) + ( 1 * 60 * 60 ) ).toString()
        await _sodium.ready
        const sodium = _sodium
        const digest = sodium.crypto_generichash(64, sodium.from_string(JSON.stringify(message)))
        const digest_base64 = sodium.to_base64(digest, base64_variants.ORIGINAL)
        const signingString = `(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest_base64}`
        return {
            signingString,
            created,
            expires
        }
    } catch (err) {
        logger.error(err)
    }
}

const signMessage = async (signingString : string, privateKey : string) => {
    await _sodium.ready
    const sodium = _sodium
    const signedMessage = sodium.crypto_sign_detached(signingString, sodium.from_base64(privateKey, base64_variants.ORIGINAL))
    return sodium.to_base64(signedMessage, base64_variants.ORIGINAL)
}

export const createAuthorizationHeader = async (message : object) => {
    try {
        const signingStringObject = await createSigningString(message)
        const signature = await signMessage(signingStringObject?.signingString!, process.env.privateKey!)
        const header = `Signature keyId="${process.env.protocolId}|${process.env.uniqueKey}|ed25519",algorithm="ed25519",created="${signingStringObject?.created}",expires="${signingStringObject?.expires}",headers="(created) (expires) digest",signature="${signature}"`
        return header
    } catch (err) {
        logger.error(err)
    }
}

export const verifyMessage = async (signedString : string, signingString : string, publicKey : string) => {
    try {
        await _sodium.ready
        const sodium = _sodium
        return sodium.crypto_sign_verify_detached(sodium.from_base64(signedString, base64_variants.ORIGINAL), signingString, sodium.from_base64(publicKey, base64_variants.ORIGINAL))
    } catch (err) {
        return false
    }
}