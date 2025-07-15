class Cache {
    static serialize(response) {
        return JSON.stringify(response, (key, value) => {
            if (value instanceof Uint8Array) {
                return Array.from(value);
            }
            return value;
        });
    }

    static deserialize(data) {
        return JSON.parse(data);
    }

    static createKey(funcName, args, kwargs, hashArgs = false) {
        const inputs = `${JSON.stringify(args)}-${JSON.stringify(kwargs)}`;
        return hashArgs ? `${funcName}-${this.hash(inputs)}` : `${funcName}-${inputs}`;
    }

    static hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return hash;
    }

    static safeCache(timeout = null, backup = false, hashArgs = false) {
        return function decorator(target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;

            descriptor.value = async function (...args) {
                const cacheKey = Cache.createKey(propertyKey, args, {}, hashArgs);
                
                try {
                    // Try getting from cache
                    const cached = localStorage.getItem(cacheKey);
                    if (cached) {
                        return Cache.deserialize(cached);
                    }

                    // Execute original function
                    const response = await originalMethod.apply(this, args);
                    const serialized = Cache.serialize(response);
                    
                    // Store in cache
                    localStorage.setItem(cacheKey, serialized);
                    if (backup) {
                        localStorage.setItem(`${cacheKey}-backup`, serialized);
                    }
                    if (timeout) {
                        setTimeout(() => localStorage.removeItem(cacheKey), timeout * 1000);
                    }

                    return response;
                } catch (error) {
                    console.error(`Failed to run ${propertyKey}`, error);
                    
                    // Try backup
                    const backupData = localStorage.getItem(`${cacheKey}-backup`);
                    if (backupData) {
                        return Cache.deserialize(backupData);
                    }
                    
                    throw error;
                }
            };

            return descriptor;
        };
    }
}
