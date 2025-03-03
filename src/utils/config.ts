import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";
import { S3Client } from '@aws-sdk/client-s3';

/** OpenAI config */
if (!import.meta.env.VITE_OPENAI_API_KEY) throw new Error("OpenAI API key is missing or invalid.");
export const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

export const deepseek = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
    dangerouslyAllowBrowser: true
});

/** Supabase config */
const privateKey = import.meta.env.VITE_SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
const url = import.meta.env.VITE_SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);
export const supabase = createClient(url, privateKey);

export const s3Client = new S3Client({
	forcePathStyle: true,
	region: import.meta.env.VITE_S3_REGION,
	endpoint: import.meta.env.VITE_S3_ENDPOINT,
	credentials: {
		accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY_ID,
		secretAccessKey: import.meta.env.VITE_S3_SECRET_ACCESS_KEY,
	}
})