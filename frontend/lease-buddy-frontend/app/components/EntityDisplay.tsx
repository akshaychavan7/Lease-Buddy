"use client"

import { Box, Typography, Paper, Button, Stack, Card, Avatar } from "@mui/material"
import { Person, LocationOn, Refresh, AttachMoney, Security, CalendarMonth, CalendarToday } from "@mui/icons-material"

interface EntityDisplayProps {
  entities: Record<string, string[]>
  filename: string
  onReset: () => void
}

// Enhanced entity configuration with more specific icons and descriptions
const entityConfig = {
  LESSOR_NAME: { 
    icon: Person, 
    color: "primary", 
    label: "Landlord",
    description: "Property owner/lessor"
  },
  LESSEE_NAME: { 
    icon: Person, 
    color: "secondary", 
    label: "Tenant",
    description: "Property renter/lessee"
  },
  PROPERTY_ADDRESS: { 
    icon: LocationOn, 
    color: "success", 
    label: "Property Address",
    description: "Location of rental property"
  },
  LEASE_START_DATE: { 
    icon: CalendarToday, 
    color: "info", 
    label: "Lease Starts",
    description: "Agreement start date"
  },
  LEASE_END_DATE: { 
    icon: CalendarMonth, 
    color: "info", 
    label: "Lease Ends",
    description: "Agreement end date"
  },
  RENT_AMOUNT: { 
    icon: AttachMoney, 
    color: "warning", 
    label: "Monthly Rent",
    description: "Regular monthly payment"
  },
  SECURITY_DEPOSIT_AMOUNT: { 
    icon: Security, 
    color: "error", 
    label: "Security Deposit",
    description: "Refundable deposit amount"
  }
}

export default function EntityDisplay({ entities, filename, onReset }: EntityDisplayProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box flex={1}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Lease Agreement Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Key information extracted from {filename}
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={onReset}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            px: 2,
          }}
        >
          Process New Document
        </Button>
      </Box>

      {/* Main Content */}
      <Stack spacing={3}>
        {/* Parties Section */}
        <Box>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            fontWeight: 500, 
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
            <Person sx={{ fontSize: 20 }} /> Parties Involved
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {["LESSOR_NAME", "LESSEE_NAME"].map((entityType) => {
              const entityList = entities[entityType] || []
              const config = entityConfig[entityType as keyof typeof entityConfig]
              if (!config || entityList.length === 0) return null

              return (
                <Box key={entityType} sx={{ flex: "1 1 300px", minWidth: 0 }}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      p: 2.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 16px -8px rgba(0,0,0,0.1)",
                        borderColor: `${config.color}.main`,
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: `${config.color}.lighter`,
                          color: `${config.color}.main`,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <config.icon />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600, 
                          mb: 0.5,
                          color: `${config.color}.main`
                        }}>
                          {config.label}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {entityList[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {config.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              )
            })}
          </Box>
        </Box>

        {/* Property Section */}
        <Box>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            fontWeight: 500, 
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
            <LocationOn sx={{ fontSize: 20 }} /> Property Details
          </Typography>
          {["PROPERTY_ADDRESS"].map((entityType) => {
            const entityList = entities[entityType] || []
            const config = entityConfig[entityType as keyof typeof entityConfig]
            if (!config || entityList.length === 0) return null

            return (
              <Card 
                key={entityType}
                elevation={0}
                sx={{ 
                  p: 2.5,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 16px -8px rgba(0,0,0,0.1)",
                    borderColor: `${config.color}.main`,
                  }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: `${config.color}.lighter`,
                      color: `${config.color}.main`,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <config.icon />
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 600, 
                      mb: 0.5,
                      color: `${config.color}.main`
                    }}>
                      {config.label}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {entityList[0]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {config.description}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            )
          })}
        </Box>

        {/* Lease Terms Section */}
        <Box>
          <Typography variant="h6" sx={{ 
            mb: 2, 
            fontWeight: 500, 
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
            <AttachMoney sx={{ fontSize: 20 }} /> Agreement Terms
          </Typography>
          <Box sx={{ 
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)"
            }
          }}>
            {["LEASE_START_DATE", "LEASE_END_DATE", "RENT_AMOUNT", "SECURITY_DEPOSIT_AMOUNT"].map((entityType) => {
              const entityList = entities[entityType] || []
              const config = entityConfig[entityType as keyof typeof entityConfig]
              if (!config || entityList.length === 0) return null

              return (
                <Card 
                  key={entityType}
                  elevation={0}
                  sx={{ 
                    p: 2.5,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    height: "100%",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 16px -8px rgba(0,0,0,0.1)",
                      borderColor: `${config.color}.main`,
                    }
                  }}
                >
                  <Stack spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${config.color}.lighter`,
                        color: `${config.color}.main`,
                        width: 44,
                        height: 44,
                        boxShadow: `0 0 0 6px ${config.color}.lighter`,
                      }}
                    >
                      <config.icon />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        mb: 0.5,
                        color: `${config.color}.main`
                      }}>
                        {config.label}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 500,
                        fontSize: "1.125rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                        {entityList[0]}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          display: "block",
                          mt: 0.5,
                          opacity: 0.8
                        }}
                      >
                        {config.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              )
            })}
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}
