"use client"

import { Box, Typography, Paper, Chip, Grid, Button, Divider } from "@mui/material"
import { Person, Business, LocationOn, DateRange, Email, Phone, Refresh, CheckCircle } from "@mui/icons-material"

interface EntityDisplayProps {
  entities: {
    PERSON: string[]
    ORGANIZATION: string[]
    LOCATION: string[]
    DATE: string[]
    EMAIL: string[]
    PHONE: string[]
  }
  filename: string
  onReset: () => void
}

const entityConfig = {
  PERSON: { icon: Person, color: "primary", label: "People" },
  ORGANIZATION: { icon: Business, color: "secondary", label: "Organizations" },
  LOCATION: { icon: LocationOn, color: "success", label: "Locations" },
  DATE: { icon: DateRange, color: "info", label: "Dates" },
  EMAIL: { icon: Email, color: "warning", label: "Email Addresses" },
  PHONE: { icon: Phone, color: "error", label: "Phone Numbers" },
}

export default function EntityDisplay({ entities, filename, onReset }: EntityDisplayProps) {
  const totalEntities = Object.values(entities).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Named Entities Extracted
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Found {totalEntities} entities in <strong>{filename}</strong>
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={onReset} sx={{ height: "fit-content" }}>
          Upload New Document
        </Button>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {totalEntities === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CheckCircle sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Named Entities Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The document was processed but no recognizable entities were identified.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Object.entries(entities).map(([entityType, entityList]) => {
            const config = entityConfig[entityType as keyof typeof entityConfig]
            const IconComponent = config.icon

            if (entityList.length === 0) return null

            return (
              <Grid item xs={12} sm={6} md={4} key={entityType}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 2,
                    border: `2px solid`,
                    borderColor: `${config.color}.light`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      elevation: 3,
                      borderColor: `${config.color}.main`,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <IconComponent
                      sx={{
                        color: `${config.color}.main`,
                        fontSize: 28,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {config.label}
                    </Typography>
                    <Chip label={entityList.length} size="small" color={config.color as any} sx={{ ml: "auto" }} />
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {entityList.slice(0, 10).map((entity, index) => (
                      <Chip
                        key={index}
                        label={entity}
                        variant="outlined"
                        size="small"
                        color={config.color as any}
                        sx={{
                          fontSize: "0.75rem",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    ))}
                    {entityList.length > 10 && (
                      <Chip
                        label={`+${entityList.length - 10} more`}
                        variant="filled"
                        size="small"
                        color={config.color as any}
                        sx={{ fontSize: "0.75rem" }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Paper>
  )
}
