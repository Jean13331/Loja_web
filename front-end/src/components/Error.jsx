const Error = ({ message, onRetry }) => {
  return (
    <div className="error">
      <h3>Erro</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry}>Tentar novamente</button>
      )}
    </div>
  )
}

export default Error

