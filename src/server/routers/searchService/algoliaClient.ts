import { env } from "@/server/env";
import { algoliasearch } from "algoliasearch";

export const algolia = () => algoliasearch(env.ALGOLIA_KEY, env.ALGOLIA_SECRET);
