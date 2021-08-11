self.onmessage = (m) => {
    if (m.data.subject == 'rotate') {
        m.data.data.push(4,5,6)
        postMessage(m.data)
    }
}