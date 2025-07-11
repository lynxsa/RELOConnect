import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { fetchVehicleClasses, fetchPriceTable, updatePricingRate } from '../../services/pricingService';
import { VehicleClass } from '../../types';
import { Card } from '../../components/ui';
import { PRIMARY_COLOR, DEFAULT_CURRENCY } from '../../utils/constants';

interface PriceTableRow {
  id: string;
  distanceBand: string;
  [vehicleId: string]: any;
}

export default function PriceAdminScreen() {
  const [vehicleClasses, setVehicleClasses] = useState<VehicleClass[]>([]);
  const [priceTable, setPriceTable] = useState<PriceTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingCell, setEditingCell] = useState<{rowId: string, vehicleName: string} | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [classes, table] = await Promise.all([
        fetchVehicleClasses(),
        fetchPriceTable(),
      ]);
      
      setVehicleClasses(classes);
      setPriceTable(table);
    } catch (err) {
      setError('Failed to load price data');
      console.error('Error loading price data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const startEditing = (rowId: string, vehicleName: string, currentValue: number) => {
    setEditingCell({ rowId, vehicleName });
    setEditValue(currentValue.toString());
  };
  
  const handleUpdatePrice = async () => {
    if (!editingCell) return;
    
    try {
      setUpdating(true);
      setError('');
      
      const newValue = parseFloat(editValue);
      if (isNaN(newValue)) {
        setError('Please enter a valid number');
        return;
      }
      
      const row = priceTable.find(row => row.id === editingCell.rowId);
      const rateId = row?.id;
      
      if (rateId) {
        await updatePricingRate(rateId, newValue);
        
        // Update local state
        setPriceTable(prevTable => 
          prevTable.map(row => {
            if (row.id === editingCell.rowId) {
              return {
                ...row,
                [editingCell.vehicleName]: newValue,
              };
            }
            return row;
          })
        );
        
        Alert.alert('Price Updated', 'The price has been successfully updated');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update price');
    } finally {
      setUpdating(false);
      setEditingCell(null);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={styles.loadingText}>Loading price table...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Price Table Administration</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Card style={styles.tableCard}>
        <ScrollView horizontal>
          <View>
            {/* Table Header */}
            <View style={styles.headerRow}>
              <View style={styles.distanceBandCell}>
                <Text style={styles.headerText}>Distance</Text>
              </View>
              {vehicleClasses.map(vehicle => (
                <View key={vehicle.id} style={styles.cell}>
                  <Text style={styles.headerText}>{vehicle.name}</Text>
                </View>
              ))}
            </View>
            
            {/* Table Rows */}
            {priceTable.map(row => (
              <View key={row.id} style={styles.row}>
                <View style={styles.distanceBandCell}>
                  <Text style={styles.bandText}>{row.distanceBand}</Text>
                </View>
                {vehicleClasses.map(vehicle => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={styles.cell}
                    onPress={() => startEditing(row.id, vehicle.name, row[vehicle.name])}
                  >
                    {editingCell?.rowId === row.id && editingCell?.vehicleName === vehicle.name ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="numeric"
                          autoFocus
                        />
                        <View style={styles.editButtons}>
                          <TouchableOpacity
                            style={[styles.editButton, styles.saveButton]}
                            onPress={handleUpdatePrice}
                            disabled={updating}
                          >
                            {updating ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text style={styles.buttonText}>Save</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editButton, styles.cancelButton]}
                            onPress={() => setEditingCell(null)}
                            disabled={updating}
                          >
                            <Text style={styles.buttonText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.priceText}>
                        {typeof row[vehicle.name] === 'number'
                          ? `${DEFAULT_CURRENCY} ${row[vehicle.name].toFixed(2)}`
                          : row[vehicle.name]}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </Card>
      
      <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
        <Text style={styles.refreshButtonText}>Refresh Table</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    width: 120,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distanceBandCell: {
    width: 100,
    padding: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  bandText: {
    fontWeight: '500',
    fontSize: 12,
  },
  priceText: {
    fontSize: 14,
  },
  editContainer: {
    width: '100%',
  },
  editInput: {
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 4,
    padding: 4,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    marginVertical: 16,
    backgroundColor: PRIMARY_COLOR,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
