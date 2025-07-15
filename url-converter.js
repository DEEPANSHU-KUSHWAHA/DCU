class ListConverter {
    static toArray(value) {
        return value ? value.split('+') : [];
    }

    static toString(values) {
        return Array.isArray(values) ? values.map(encodeURIComponent).join('+') : '';
    }
}

export default ListConverter;
