"use client"
import { useElasticSearch } from "./elasticsearch.hook"
import { useTransformer } from "./transformer.hook"

type Hook = 'elastic' | 'transformer'

export const getHook = (hook: Hook) => {
    switch (hook) {
        case 'elastic':
            return useElasticSearch
        case 'transformer' :
            return useTransformer
    }
}
