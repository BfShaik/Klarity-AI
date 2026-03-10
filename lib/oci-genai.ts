/**
 * OCI Generative AI client using OpenAI-compatible API.
 * Uses OCI API Keys — create in Console: Generative AI → API Keys.
 * See: https://github.com/oracle-samples/oci-openai
 *
 * Supported models: meta.llama-3.3-70b-instruct, xai.grok-3, openai.gpt-oss-120b
 */

import OpenAI from "openai";

const apiKey = process.env.OCI_GENAI_API_KEY;
const region = process.env.OCI_GENAI_REGION ?? "us-chicago-1";
const compartmentId = process.env.OCI_GENAI_COMPARTMENT_ID;

const baseURL = `https://inference.generativeai.${region}.oci.oraclecloud.com/20231130/actions/v1`;

export const ociGenAI =
  apiKey &&
  new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: compartmentId ? { CompartmentId: compartmentId } : undefined,
  });

export const OCI_DEFAULT_MODEL = process.env.OCI_GENAI_MODEL ?? "xai.grok-4";
