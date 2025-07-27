"use client"
import "./EntityDisplay.css"

const EntityDisplay = ({ entities, filename, onReset }) => {
  const entityConfig = {
    PERSON: { icon: "👤", color: "primary", label: "People" },
    ORGANIZATION: { icon: "🏢", color: "secondary", label: "Organizations" },
    LOCATION: { icon: "📍", color: "success", label: "Locations" },
    DATE: { icon: "📅", color: "info", label: "Dates" },
    EMAIL: { icon: "📧", color: "warning", label: "Email Addresses" },
    PHONE: { icon: "📞", color: "error", label: "Phone Numbers" },
  }

  const totalEntities = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="entity-display">
      <div className="entity-header">
        <div className="entity-info">
          <h2 className="entity-title">Named Entities Extracted</h2>
          <p className="entity-subtitle">
            Found {totalEntities} entities in <strong>{filename}</strong>
          </p>
        </div>
        <button className="reset-button" onClick={onReset}>
          🔄 Upload New Document
        </button>
      </div>

      <div className="entity-divider"></div>

      {totalEntities === 0 ? (
        <div className="no-entities">
          <div className="no-entities-icon">✅</div>
          <h3 className="no-entities-title">No Named Entities Found</h3>
          <p className="no-entities-description">
            The document was processed but no recognizable entities were identified.
          </p>
        </div>
      ) : (
        <div className="entity-grid">
          {Object.entries(entities).map(([entityType, entityList]) => {
            const config = entityConfig[entityType]

            if (entityList.length === 0) return null

            return (
              <div key={entityType} className={`entity-card ${config.color}`}>
                <div className="entity-card-header">
                  <span className="entity-icon">{config.icon}</span>
                  <h3 className="entity-card-title">{config.label}</h3>
                  <span className="entity-count">{entityList.length}</span>
                </div>

                <div className="entity-chips">
                  {entityList.slice(0, 10).map((entity, index) => (
                    <span key={index} className={`entity-chip ${config.color}`}>
                      {entity}
                    </span>
                  ))}
                  {entityList.length > 10 && (
                    <span className={`entity-chip ${config.color} more-chip`}>+{entityList.length - 10} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EntityDisplay
