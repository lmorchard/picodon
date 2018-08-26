const crypto = require("crypto");
const { asc, fetchJson } = require("./utils");

const signRequest = ({
  keyId,
  privateKey,
  method,
  path,
  headers,
  algorithm = "SHA256"
}) => {
  const lcHeaders = normalizeHeaders(headers);
  const headerNames = Object.keys(lcHeaders).sort(asc);
  const toSign = requestCleartext({ method, path, headerNames, lcHeaders });

  const signature = crypto
    .createSign(normalizeAlgorithm(algorithm))
    .update(toSign)
    .sign(privateKey, "base64");

  return [
    `keyId="${keyId}"`,
    `headers="(request-target) ${headerNames.join(" ")}"`,
    `signature="${signature}"`
  ].join(", ");
};

const verifyRequest = async ({ method, path, headers }) => {
  const lcHeaders = normalizeHeaders(headers);
  const sigParts = lcHeaders.signature.split(/, ?/).reduce((acc, part) => {
    const [key, value] = part.split("=");
    return { ...acc, [key]: value.split('"')[1] };
  }, {});

  const {
    signature,
    keyId,
    algorithm = "SHA256",
    headers: sigHeaders
  } = sigParts;

  const headerNames = sigHeaders
    .split(" ")
    .filter(k => k !== "(request-target)");
  const toVerify = requestCleartext({ method, path, headerNames, lcHeaders });

  const key = await getPublicKey({ keyId });
  if (!key) return false;

  return crypto
    .createVerify(normalizeAlgorithm(algorithm))
    .update(toVerify)
    .verify(key, signature, "base64");
};

const requestCleartext = ({
  method = "POST",
  path = "/",
  headerNames,
  lcHeaders
}) =>
  `(request-target): ${method.toLowerCase()} ${path}\n` +
  headerNames.map(k => `${k}: ${lcHeaders[k]}`).join("\n");

const lcAlgorithms = crypto
  .getHashes()
  .reduce((acc, name) => ({ ...acc, [name.toLowerCase()]: name }), {});

const normalizeAlgorithm = algorithm => lcAlgorithms[algorithm.toLowerCase()];

const normalizeHeaders = headers =>
  Object.entries(headers).reduce(
    (acc, [k, v]) => ({ ...acc, [k.toLowerCase()]: v }),
    {}
  );

// TODO: cache public keys
const getPublicKey = async ({ keyId }) => {
  try {
    const actor = await fetchJson(keyId);
    let publicKey = actor.publicKey;
    if (typeof actor.publicKey === "string") {
      publicKey = await fetchJson(publicKey);
    }
    // TODO: verify owner?
    return publicKey.publicKeyPem;
  } catch (e) {
    return null;
  }
};

module.exports = {
  signRequest,
  verifyRequest,
  fetchJson,
  getPublicKey
};
